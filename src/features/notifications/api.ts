import { apiFetch } from '@/src/api/client';
import { getItemAsync, setItemAsync } from '@/src/storage/secureStorage';

import { mapNotificationsList } from './mapNotifications';
import type { NotificationsInbox, NotificationPreferences, RegisterDeviceBody } from './types';

const PREFS_STORAGE_KEY = 'watts.push.preferences';

const DEFAULT_PREFERENCES: NotificationPreferences = {
  RECOMMENDATION_READY: true,
  WORKOUT_ANALYSIS_READY: true,
  SYNC_COMPLETED: true,
  COACH_MESSAGE: true,
};

async function readErrorMessage(response: Response, fallback: string): Promise<string> {
  try {
    const body = (await response.json()) as { message?: string; statusMessage?: string };
    return body.message || body.statusMessage || fallback;
  } catch {
    return fallback;
  }
}

export async function fetchNotifications(
  options: { limit?: number; page?: number } = {}
): Promise<NotificationsInbox> {
  const limit = Math.min(Math.max(options.limit ?? 50, 1), 100);
  const page = Math.max(options.page ?? 1, 1);
  const params = new URLSearchParams({
    limit: String(limit),
    page: String(page),
  });
  const response = await apiFetch(`/api/notifications?${params.toString()}`);
  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, `Failed to load notifications (${response.status})`)
    );
  }
  return mapNotificationsList(await response.json());
}

export async function markNotificationRead(id: string): Promise<void> {
  const response = await apiFetch('/api/notifications/read', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  });
  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, `Failed to mark notification read (${response.status})`)
    );
  }
}

export async function markAllNotificationsRead(): Promise<void> {
  const response = await apiFetch('/api/notifications/read', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ all: true }),
  });
  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, `Failed to mark all notifications read (${response.status})`)
    );
  }
}

export type DeviceRegistrationResult =
  | { ok: true; unavailable?: false }
  | { ok: false; unavailable: true; status: number }
  | { ok: false; unavailable: false; error: string };

export async function registerMobileDevice(
  body: RegisterDeviceBody
): Promise<DeviceRegistrationResult> {
  const response = await apiFetch('/api/mobile/devices', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (response.status === 404) {
    return { ok: false, unavailable: true, status: 404 };
  }

  if (!response.ok) {
    return {
      ok: false,
      unavailable: false,
      error: await readErrorMessage(response, `Device registration failed (${response.status})`),
    };
  }

  return { ok: true };
}

export async function unregisterMobileDevice(token: string): Promise<void> {
  const response = await apiFetch('/api/mobile/devices', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });

  if (response.status === 404 || response.ok) {
    return;
  }

  console.warn(await readErrorMessage(response, `Device unregister failed (${response.status})`));
}

export async function fetchNotificationPreferences(): Promise<NotificationPreferences> {
  // 1. Attempt to fetch from backend
  try {
    const response = await apiFetch('/api/mobile/devices/preferences');
    if (response.ok) {
      const data = await response.json();
      if (data && typeof data === 'object') {
        const parsed = data as NotificationPreferences;
        await setItemAsync(PREFS_STORAGE_KEY, JSON.stringify(parsed));
        return parsed;
      }
    }
  } catch (error) {
    console.warn('Failed to fetch preferences from backend, using local:', error);
  }

  // 2. Local fallback
  const stored = await getItemAsync(PREFS_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored) as NotificationPreferences;
    } catch {
      // ignore
    }
  }
  return DEFAULT_PREFERENCES;
}

export async function updateNotificationPreferences(
  preferences: NotificationPreferences
): Promise<NotificationPreferences> {
  // 1. Always update local storage first
  await setItemAsync(PREFS_STORAGE_KEY, JSON.stringify(preferences));

  // 2. Sync with backend
  try {
    const response = await apiFetch('/api/mobile/devices/preferences', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ preferences }),
    });
    if (response.ok) {
      const data = await response.json();
      if (data && typeof data === 'object') {
        return data as NotificationPreferences;
      }
    }
  } catch (error) {
    console.warn('Failed to sync preferences with backend:', error);
  }

  return preferences;
}
