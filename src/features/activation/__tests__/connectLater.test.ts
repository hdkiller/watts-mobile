import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  activationIdentity,
  clearConnectLater,
  getConnectLater,
  setConnectLater,
} from '../connectLater';

const { store } = vi.hoisted(() => ({ store: new Map<string, string>() }));

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn(async (key: string) => store.get(key) ?? null),
    setItem: vi.fn(async (key: string, value: string) => {
      store.set(key, value);
    }),
    removeItem: vi.fn(async (key: string) => {
      store.delete(key);
    }),
    getAllKeys: vi.fn(async () => [...store.keys()]),
    multiRemove: vi.fn(async (keys: string[]) => {
      keys.forEach((key) => store.delete(key));
    }),
  },
}));

describe('connectLater', () => {
  beforeEach(async () => {
    store.clear();
    await clearConnectLater();
  });

  it('scopes the preference by instance and account', async () => {
    const first = activationIdentity('https://one.example', { sub: 'athlete-1' });
    const second = activationIdentity('https://one.example', { sub: 'athlete-2' });
    expect(first).not.toBeNull();
    expect(second).not.toBeNull();

    await setConnectLater(first!, true);

    expect(await getConnectLater(first)).toBe(true);
    expect(await getConnectLater(second)).toBe(false);
  });

  it('clears all activation preferences during an identity transition', async () => {
    const identity = activationIdentity('https://one.example/', { email: 'a@example.com' });
    await setConnectLater(identity!, true);

    await clearConnectLater();

    expect(await getConnectLater(identity)).toBe(false);
  });
});
