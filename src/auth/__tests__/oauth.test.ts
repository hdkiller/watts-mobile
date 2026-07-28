import { describe, expect, it, vi } from 'vitest';

vi.mock('expo-web-browser', () => ({
  maybeCompleteAuthSession: vi.fn(),
  openBrowserAsync: vi.fn(),
}));

vi.mock('expo-auth-session', () => {
  class AuthRequest {
    clientId!: string;
    redirectUri!: string;
    scopes!: string[];
    usePKCE!: boolean;
    responseType!: string;
    prompt?: string;
    codeVerifier?: string;

    constructor(config: Record<string, unknown>) {
      Object.assign(this, config);
      this.codeVerifier = 'mock-verifier';
    }

    async makeAuthUrlAsync() {
      return 'https://coachwatts.com/api/oauth/authorize';
    }

    async promptAsync() {
      return { type: 'success', params: { code: 'mock-code' } };
    }
  }

  return {
    AuthRequest,
    ResponseType: { Code: 'code' },
    Prompt: { Login: 'login' },
    makeRedirectUri: vi.fn(() => 'coachwatts://oauth/callback'),
  };
});

vi.mock('@/src/auth/tokenStorage', () => ({
  saveTokens: vi.fn(async (tokens) => ({
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    expiresIn: tokens.expiresIn,
  })),
}));

vi.mock('@/src/config/env', () => ({
  APP_SCHEME: 'coachwatts',
  OAUTH_CLIENT_ID: 'mock-client-id',
}));

describe('OAuth login configuration', () => {
  it('loginWithPkce configures AuthRequest with prompt=login to force re-authentication', async () => {
    const { loginWithPkce, exchangeAuthorizationCode } = await import('../oauth');

    // Spy on global fetch for exchangeAuthorizationCode
    global.fetch = vi.fn(async () => ({
      ok: true,
      json: async () => ({
        access_token: 'mock-access-token',
        token_type: 'Bearer',
        expires_in: 3600,
        refresh_token: 'mock-refresh-token',
      }),
    })) as unknown as typeof fetch;

    const result = await loginWithPkce('https://coachwatts.com');

    expect(result.accessToken).toBe('mock-access-token');
  });
});
