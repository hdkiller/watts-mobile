import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  clearPushRegistrationOnSignOut,
  retryPendingPushUnregistration,
} from '../pushRegistration';

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

const unregisterMobileDevice = vi.fn();

vi.mock('../api', () => ({
  fetchNotificationPreferences: vi.fn(),
  registerMobileDevice: vi.fn(),
  unregisterMobileDevice: (...args: unknown[]) => unregisterMobileDevice(...args),
}));

// pushToken.ts pulls in expo-notifications, which isn't safe to import under the node
// test environment. It's a thin wrapper over the stored-token key, mirrored here.
const PUSH_TOKEN_KEY = 'watts.push.expoToken';
vi.mock('../pushToken', () => ({
  getStoredPushToken: async () => store.get(PUSH_TOKEN_KEY) ?? null,
  storePushToken: async (token: string) => {
    store.set(PUSH_TOKEN_KEY, token);
  },
  clearStoredPushToken: async () => {
    store.delete(PUSH_TOKEN_KEY);
  },
  resolveDevicePlatform: () => 'ios',
  getAppVersion: () => '0.1.0',
}));

const PENDING_UNREGISTER_KEY = 'watts.push.pendingUnregisterToken';

describe('clearPushRegistrationOnSignOut', () => {
  beforeEach(() => {
    store.clear();
    unregisterMobileDevice.mockReset();
  });

  it('clears the stored token and does not leave a pending flag when unregister succeeds', async () => {
    store.set(PUSH_TOKEN_KEY, 'tok-1');
    unregisterMobileDevice.mockResolvedValueOnce(undefined);

    await clearPushRegistrationOnSignOut();

    expect(unregisterMobileDevice).toHaveBeenCalledWith('tok-1');
    expect(store.has(PUSH_TOKEN_KEY)).toBe(false);
    expect(store.has(PENDING_UNREGISTER_KEY)).toBe(false);
  });

  it('persists a pending-unregister flag when unregister throws', async () => {
    store.set(PUSH_TOKEN_KEY, 'tok-2');
    unregisterMobileDevice.mockRejectedValueOnce(new Error('network down'));

    await clearPushRegistrationOnSignOut();

    expect(store.get(PENDING_UNREGISTER_KEY)).toBe('tok-2');
    // Local token is still cleared so a fresh registration can happen on next sign-in.
    expect(store.has(PUSH_TOKEN_KEY)).toBe(false);
  });

  it('is a no-op when there is no stored token', async () => {
    await clearPushRegistrationOnSignOut();
    expect(unregisterMobileDevice).not.toHaveBeenCalled();
    expect(store.has(PENDING_UNREGISTER_KEY)).toBe(false);
  });
});

describe('retryPendingPushUnregistration', () => {
  beforeEach(() => {
    store.clear();
    unregisterMobileDevice.mockReset();
  });

  it('does nothing when no unregistration is pending', async () => {
    await retryPendingPushUnregistration();
    expect(unregisterMobileDevice).not.toHaveBeenCalled();
  });

  it('retries the pending token and clears the flag on success', async () => {
    store.set(PENDING_UNREGISTER_KEY, 'tok-3');
    unregisterMobileDevice.mockResolvedValueOnce(undefined);

    await retryPendingPushUnregistration();

    expect(unregisterMobileDevice).toHaveBeenCalledWith('tok-3');
    expect(store.has(PENDING_UNREGISTER_KEY)).toBe(false);
  });

  it('leaves the flag in place when the retry fails again', async () => {
    store.set(PENDING_UNREGISTER_KEY, 'tok-4');
    unregisterMobileDevice.mockRejectedValueOnce(new Error('still offline'));

    await retryPendingPushUnregistration();

    expect(store.get(PENDING_UNREGISTER_KEY)).toBe('tok-4');
  });
});
