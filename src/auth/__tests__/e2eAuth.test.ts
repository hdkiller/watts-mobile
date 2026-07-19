import { afterEach, describe, expect, it, vi } from 'vitest';

const { saveTokens, setInstanceUrl, normalizeInstanceUrl } = vi.hoisted(() => {
  function normalizeInstanceUrl(input: string): string {
    const trimmed = input.trim();
    if (!trimmed) return '';
    let url = trimmed;
    if (!/^https?:\/\//i.test(url)) {
      url = `https://${url}`;
    }
    return url.replace(/\/+$/, '');
  }

  return {
    normalizeInstanceUrl,
    saveTokens: vi.fn(async () => ({
      accessToken: 'tok',
      refreshToken: null,
      accessExpiresAt: null,
    })),
    setInstanceUrl: vi.fn(async (url: string) => normalizeInstanceUrl(url)),
  };
});

vi.mock('expo-constants', () => ({
  default: { expoConfig: { extra: {}, version: '0.1.0' } },
}));

vi.mock('@/src/auth/tokenStorage', () => ({
  saveTokens,
}));

vi.mock('@/src/config/instance', () => ({
  normalizeInstanceUrl,
  setInstanceUrl,
}));

describe('e2eAuth host allowlist', () => {
  afterEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  it('allows loopback and Android emulator hosts', async () => {
    vi.stubEnv('EXPO_PUBLIC_E2E_AUTH', '1');
    vi.stubEnv('EXPO_PUBLIC_E2E_ALLOW_ANY_HOST', '');
    vi.stubEnv('EXPO_PUBLIC_E2E_ALLOWED_HOSTS', '');
    const { isE2eInstanceHostAllowed } = await import('../e2eAuth');
    expect(isE2eInstanceHostAllowed('http://localhost:3099')).toBe(true);
    expect(isE2eInstanceHostAllowed('http://127.0.0.1:3099')).toBe(true);
    expect(isE2eInstanceHostAllowed('http://10.0.2.2:3099')).toBe(true);
  });

  it('rejects arbitrary hosts by default', async () => {
    vi.stubEnv('EXPO_PUBLIC_E2E_AUTH', '1');
    vi.stubEnv('EXPO_PUBLIC_E2E_ALLOW_ANY_HOST', '');
    vi.stubEnv('EXPO_PUBLIC_E2E_ALLOWED_HOSTS', '');
    const { isE2eInstanceHostAllowed } = await import('../e2eAuth');
    expect(isE2eInstanceHostAllowed('https://coachwatts.com')).toBe(false);
  });

  it('allows hosts listed in EXPO_PUBLIC_E2E_ALLOWED_HOSTS', async () => {
    vi.stubEnv('EXPO_PUBLIC_E2E_AUTH', '1');
    vi.stubEnv('EXPO_PUBLIC_E2E_ALLOW_ANY_HOST', '');
    vi.stubEnv('EXPO_PUBLIC_E2E_ALLOWED_HOSTS', 'staging.example.com, e2e.local');
    const { isE2eInstanceHostAllowed } = await import('../e2eAuth');
    expect(isE2eInstanceHostAllowed('https://staging.example.com')).toBe(true);
    expect(isE2eInstanceHostAllowed('http://e2e.local:3099')).toBe(true);
  });
});

describe('applyE2eAuthSeed', () => {
  afterEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
    saveTokens.mockClear();
    setInstanceUrl.mockClear();
  });

  it('returns null when e2e auth is off', async () => {
    vi.stubEnv('EXPO_PUBLIC_E2E_AUTH', '');
    const { applyE2eAuthSeed } = await import('../e2eAuth');
    await expect(applyE2eAuthSeed()).resolves.toBeNull();
  });

  it('seeds instance + tokens when configured', async () => {
    vi.stubEnv('EXPO_PUBLIC_E2E_AUTH', '1');
    vi.stubEnv('EXPO_PUBLIC_E2E_INSTANCE_URL', 'http://localhost:3099');
    vi.stubEnv('EXPO_PUBLIC_E2E_ACCESS_TOKEN', 'fixture-access');
    vi.stubEnv('EXPO_PUBLIC_E2E_REFRESH_TOKEN', 'fixture-refresh');
    vi.stubEnv('EXPO_PUBLIC_E2E_ALLOW_ANY_HOST', '');
    vi.stubEnv('EXPO_PUBLIC_E2E_ALLOWED_HOSTS', '');

    const { applyE2eAuthSeed } = await import('../e2eAuth');

    await expect(applyE2eAuthSeed()).resolves.toEqual({
      instanceUrl: 'http://localhost:3099',
      accessToken: 'fixture-access',
    });
    expect(setInstanceUrl).toHaveBeenCalledWith('http://localhost:3099');
    expect(saveTokens).toHaveBeenCalledWith({
      accessToken: 'fixture-access',
      refreshToken: 'fixture-refresh',
    });
  });

  it('throws when token is missing', async () => {
    vi.stubEnv('EXPO_PUBLIC_E2E_AUTH', '1');
    vi.stubEnv('EXPO_PUBLIC_E2E_INSTANCE_URL', 'http://localhost:3099');
    vi.stubEnv('EXPO_PUBLIC_E2E_ACCESS_TOKEN', '');
    const { applyE2eAuthSeed } = await import('../e2eAuth');
    await expect(applyE2eAuthSeed()).rejects.toThrow(/E2E_ACCESS_TOKEN/);
  });
});
