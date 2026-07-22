import { fetchNotificationPreferences, registerMobileDevice, unregisterMobileDevice } from './api';
import {
  acquireExpoPushToken,
  clearStoredPushToken,
  getAppVersion,
  getStoredPushToken,
  resolveDevicePlatform,
  storePushToken,
} from './pushToken';

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
    } catch (error) {
      console.warn('Failed to unregister push device on sign-out', error);
    }
  }
  try {
    await clearStoredPushToken();
  } catch (error) {
    console.warn('Failed to clear local push token on sign-out', error);
  }
}
