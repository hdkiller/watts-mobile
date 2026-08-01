import { deleteItemAsync, getItemAsync, setItemAsync } from '@/src/storage/secureStorage';

import { fetchNotificationPreferences, registerMobileDevice, unregisterMobileDevice } from './api';
import {
  acquireExpoPushToken,
  clearStoredPushToken,
  getAppVersion,
  getStoredPushToken,
  resolveDevicePlatform,
  storePushToken,
} from './pushToken';

// Persisted (SecureStore, same mechanism pushToken.ts uses for the token itself) so a
// push token that failed to unregister on sign-out gets a retry on next launch/foreground
// instead of staying registered server-side for a session the user already left.
const PENDING_UNREGISTER_KEY = 'watts.push.pendingUnregisterToken';

async function markPendingPushUnregister(token: string): Promise<void> {
  try {
    await setItemAsync(PENDING_UNREGISTER_KEY, token);
  } catch (error) {
    console.warn('Failed to persist pending push unregister token', error);
  }
}

async function clearPendingPushUnregister(): Promise<void> {
  try {
    await deleteItemAsync(PENDING_UNREGISTER_KEY);
  } catch (error) {
    console.warn('Failed to clear pending push unregister token', error);
  }
}

export type PushRegistrationStatus =
  | { state: 'skipped'; reason: string }
  | { state: 'registered'; token: string }
  | { state: 'unavailable'; token: string }
  | { state: 'failed'; error: string };

export async function registerPushForAuthenticatedSession(): Promise<PushRegistrationStatus> {
  const platform = resolveDevicePlatform();
  if (!platform) {
    return { state: 'skipped', reason: 'Push registration is not supported on this platform' };
  }

  const token = await acquireExpoPushToken();
  if (!token) {
    return { state: 'skipped', reason: 'Notification permission not granted or token unavailable' };
  }

  await storePushToken(token);

  let preferences: Awaited<ReturnType<typeof fetchNotificationPreferences>> | undefined;
  try {
    preferences = await fetchNotificationPreferences();
  } catch (error) {
    console.warn('Push registration continuing without preferences payload', error);
  }

  const result = await registerMobileDevice({
    token,
    platform,
    appVersion: getAppVersion(),
    ...(preferences ? { preferences } : {}),
  });

  if (result.ok) {
    return { state: 'registered', token };
  }

  if (result.unavailable) {
    return { state: 'unavailable', token };
  }

  return { state: 'failed', error: result.error };
}

export async function clearPushRegistrationOnSignOut(): Promise<void> {
  const token = await getStoredPushToken();
  if (token) {
    try {
      await unregisterMobileDevice(token);
      await clearPendingPushUnregister();
    } catch (error) {
      console.warn('Failed to unregister push device on sign-out', error);
      // Leave the token registered server-side is not acceptable for a signed-out
      // session — remember it and retry on next launch/foreground.
      await markPendingPushUnregister(token);
    }
  }
  try {
    await clearStoredPushToken();
  } catch (error) {
    console.warn('Failed to clear local push token on sign-out', error);
  }
}

/**
 * Retries a push-device unregistration that failed during a previous sign-out.
 * No-op when there is nothing pending. Safe to call on every app launch/foreground —
 * intended to be invoked from PushNotificationsBootstrap.
 */
export async function retryPendingPushUnregistration(): Promise<void> {
  let pendingToken: string | null = null;
  try {
    pendingToken = await getItemAsync(PENDING_UNREGISTER_KEY);
  } catch (error) {
    console.warn('Failed to read pending push unregister token', error);
    return;
  }

  if (!pendingToken) {
    return;
  }

  try {
    await unregisterMobileDevice(pendingToken);
    await clearPendingPushUnregister();
  } catch (error) {
    console.warn('Retry of pending push unregistration failed, will retry again later', error);
  }
}
