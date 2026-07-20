import { beforeEach, describe, expect, it, vi } from 'vitest';

const store = new Map<string, string>();

vi.mock('@/src/storage/secureStorage', () => ({
  getItemAsync: vi.fn(async (key: string) => store.get(key) ?? null),
  setItemAsync: vi.fn(async (key: string, value: string) => {
    store.set(key, value);
  }),
  deleteItemAsync: vi.fn(async (key: string) => {
    store.delete(key);
  }),
}));

import { clearTokens, loadTokens, saveTokens } from '../tokenStorage';

describe('saveTokens', () => {
  beforeEach(() => {
    store.clear();
  });

  it('deletes refresh token and expiry when explicitly null', async () => {
    await saveTokens({ accessToken: 'a1', refreshToken: 'r1', expiresIn: 3600 });
    expect(store.get('cw.refreshToken')).toBe('r1');
    expect(store.has('cw.accessExpiresAt')).toBe(true);

    const next = await saveTokens({
      accessToken: 'a2',
      refreshToken: null,
      expiresIn: null,
    });
    expect(next.refreshToken).toBeNull();
    expect(next.accessExpiresAt).toBeNull();
    expect(store.has('cw.refreshToken')).toBe(false);
    expect(store.has('cw.accessExpiresAt')).toBe(false);
  });

  it('preserves refresh token and expiry when omitted (undefined)', async () => {
    await saveTokens({ accessToken: 'a1', refreshToken: 'r1', expiresIn: 3600 });
    const kept = await saveTokens({ accessToken: 'a2' });
    expect(kept.refreshToken).toBe('r1');
    expect(kept.accessExpiresAt).not.toBeNull();
    expect(store.get('cw.refreshToken')).toBe('r1');
  });

  it('clears all keys', async () => {
    await saveTokens({ accessToken: 'a1', refreshToken: 'r1', expiresIn: 60 });
    await clearTokens();
    expect(await loadTokens()).toBeNull();
  });
});
