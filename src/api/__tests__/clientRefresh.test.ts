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
  clearTokens: () => mockClearTokens(),
}));

import { apiFetch, setAuthFailureHandler } from '../client';

describe('apiFetch token refresh error handling (CW-135)', () => {
  const failureHandler = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
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

    const response = await apiFetch('/api/test-endpoint');

    expect(response.status).toBe(401);
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

    const response = await apiFetch('/api/test-endpoint');

    expect(response.status).toBe(401);
    expect(mockClearTokens).not.toHaveBeenCalled();
    expect(failureHandler).not.toHaveBeenCalled();
  });
});
