import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('expo-web-browser', () => ({
  maybeCompleteAuthSession: vi.fn(),
  openBrowserAsync: vi.fn(),
}));

vi.mock('expo-auth-session', () => ({
  makeRedirectUri: vi.fn(() => 'coachwatts://oauth/callback'),
}));

vi.mock('@/src/config/env', () => ({
  APP_SCHEME: 'coachwatts',
  OAUTH_CLIENT_ID: 'mock-client-id',
}));

vi.mock('@/src/config/instance', () => ({
  getInstanceUrl: vi.fn(async () => 'https://coachwatts.com'),
}));

const mockLoadTokens = vi.fn();
const mockClearTokens = vi.fn();

vi.mock('@/src/auth/tokenStorage', () => ({
  loadTokens: () => mockLoadTokens(),
  clearTokens: (...args: unknown[]) => mockClearTokens(...args),
}));

import {
  bumpAuthSessionGeneration,
  apiFetch,
  fetchUserInfo,
  setAuthFailureHandler,
} from '../client';
import { ApiError, isReachabilityError } from '../errors';
import { resetAuthSessionGenerationForTests } from '@/src/auth/authSessionGeneration';

describe('apiFetch token refresh error handling (CW-135)', () => {
  const failureHandler = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    resetAuthSessionGenerationForTests();
    setAuthFailureHandler(failureHandler);
    mockLoadTokens.mockResolvedValue({
      accessToken: 'stale-access-token',
      refreshToken: 'valid-refresh-token',
    });
  });

  it('does NOT invoke failAuthSession on transient network error during refresh', async () => {
    // 1st fetch: API call returns 401 Unauthorized
    // 2nd fetch (token refresh endpoint): throws TypeError network failure
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        status: 401,
        ok: false,
      } as Response)
      .mockRejectedValueOnce(new TypeError('Network request failed'));

    // The network error must propagate distinctly (CW-276) rather than resolving
    // to the original stale 401 response — otherwise callers inspecting the HTTP
    // status (e.g. fetchUserInfo -> isReachabilityError) would misclassify this as
    // a genuine auth failure instead of a connectivity problem.
    await expect(apiFetch('/api/test-endpoint')).rejects.toThrow('Network request failed');
    expect(mockClearTokens).not.toHaveBeenCalled();
    expect(failureHandler).not.toHaveBeenCalled();
  });

  it('invokes failAuthSession on explicit HTTP 400/401 unrecoverable OAuth error during refresh', async () => {
    // 1st fetch: API call returns 401 Unauthorized
    // 2nd fetch (token refresh endpoint): returns HTTP 400 invalid_grant
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        status: 401,
        ok: false,
      } as Response)
      .mockResolvedValueOnce({
        status: 400,
        ok: false,
        json: async () => ({ error: 'invalid_grant', error_description: 'Refresh token invalid' }),
      } as Response);

    const response = await apiFetch('/api/test-endpoint');

    expect(response.status).toBe(401);
    expect(mockClearTokens).toHaveBeenCalledTimes(1);
    expect(failureHandler).toHaveBeenCalledTimes(1);
  });

  it('does NOT invoke failAuthSession on HTTP 502 server error during refresh', async () => {
    // 1st fetch: API call returns 401 Unauthorized
    // 2nd fetch (token refresh endpoint): returns HTTP 502 Bad Gateway
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        status: 401,
        ok: false,
      } as Response)
      .mockResolvedValueOnce({
        status: 502,
        ok: false,
        json: async () => ({ error: 'Bad Gateway' }),
      } as Response);

    // The 502 must propagate distinctly (CW-276) rather than resolving to the
    // original stale 401 response, so callers can classify it as a server error
    // rather than a genuine auth failure.
    await expect(apiFetch('/api/test-endpoint')).rejects.toMatchObject({ status: 502 });
    expect(mockClearTokens).not.toHaveBeenCalled();
    expect(failureHandler).not.toHaveBeenCalled();
  });

  it('ignores stale 401 handling after auth session generation bumps (re-login race)', async () => {
    let requestStarted!: () => void;
    const requestStartedPromise = new Promise<void>((resolve) => {
      requestStarted = resolve;
    });
    let finishRequest!: () => void;
    const requestGate = new Promise<void>((resolve) => {
      finishRequest = resolve;
    });

    global.fetch = vi.fn().mockImplementation(async (input: RequestInfo) => {
      const url = String(input);
      if (url.includes('/api/oauth/token')) {
        return {
          status: 400,
          ok: false,
          json: async () => ({ error: 'invalid_grant' }),
        } as Response;
      }
      // First API call: hold the 401 until after a simulated re-login bump.
      requestStarted();
      await requestGate;
      return { status: 401, ok: false } as Response;
    });

    const pending = apiFetch('/api/test-endpoint');
    await requestStartedPromise;
    bumpAuthSessionGeneration();
    finishRequest();

    const response = await pending;
    expect(response.status).toBe(401);
    expect(mockClearTokens).not.toHaveBeenCalled();
    expect(failureHandler).not.toHaveBeenCalled();
  });
});

describe('fetchUserInfo error classification (CW-161)', () => {
  const failureHandler = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    resetAuthSessionGenerationForTests();
    setAuthFailureHandler(failureHandler);
    mockLoadTokens.mockResolvedValue({
      accessToken: 'valid-access-token',
      refreshToken: 'valid-refresh-token',
    });
  });

  it('throws an ApiError carrying the HTTP status on a definitive 401', async () => {
    // Both the initial request and the refresh retry come back 401 (no refresh token
    // rotation possible) — a genuine, definitive auth failure.
    global.fetch = vi.fn().mockResolvedValue({ status: 401, ok: false } as Response);
    mockLoadTokens.mockResolvedValue({
      accessToken: 'valid-access-token',
      refreshToken: undefined,
    });

    await expect(fetchUserInfo()).rejects.toMatchObject(new ApiError('userinfo failed (401)', 401));
  });

  it('throws an ApiError carrying the HTTP status on a 5xx server error', async () => {
    global.fetch = vi.fn().mockResolvedValue({ status: 503, ok: false } as Response);

    await expect(fetchUserInfo()).rejects.toMatchObject(new ApiError('userinfo failed (503)', 503));
  });

  it('propagates a raw network error (no HTTP status available)', async () => {
    global.fetch = vi.fn().mockRejectedValue(new TypeError('Network request failed'));

    await expect(fetchUserInfo()).rejects.toBeInstanceOf(TypeError);
  });

  it('classifies a network failure during 401-triggered refresh as reachability, not auth failure (CW-276)', async () => {
    // 1st fetch (userinfo): 401 Unauthorized (e.g. an expired access token).
    // 2nd fetch (token refresh endpoint): throws TypeError network failure.
    // Regression guard: previously apiFetch's catch block swallowed the network
    // error during refresh and returned the original stale 401 Response, which
    // fetchUserInfo turned into ApiError(401) — and isReachabilityError treats any
    // defined HTTP status as authoritative, so a 401 was misclassified as a
    // genuine auth failure instead of a reachability problem.
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({ status: 401, ok: false } as Response)
      .mockRejectedValueOnce(new TypeError('Network request failed'));

    let caught: unknown;
    try {
      await fetchUserInfo();
    } catch (err) {
      caught = err;
    }

    expect(caught).toBeInstanceOf(TypeError);
    expect(isReachabilityError(caught)).toBe(true);
    expect(mockClearTokens).not.toHaveBeenCalled();
    expect(failureHandler).not.toHaveBeenCalled();
  });
});
