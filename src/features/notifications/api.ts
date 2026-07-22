import { apiFetch } from '@/src/api/client';
import { getItemAsync, setItemAsync } from '@/src/storage/secureStorage';

import { mapNotificationsList } from './mapNotifications';
import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  normalizeNotificationPreferences,
} from './preferences';
import type { NotificationsInbox, NotificationPreferences, RegisterDeviceBody } from './types';

const PREFS_STORAGE_KEY = 'watts.push.preferences';

async function readErrorMessage(response: Response, fallback: string): Promise<string> {
  try {
    const body = (await response.json()) as { message?: string; statusMessage?: string };
    return body.message || body.statusMessage || fallback;
  } catch {
    return fallback;
  }
}

async function cachePreferences(preferences: NotificationPreferences): Promise<void> {
  await setItemAsync(PREFS_STORAGE_KEY, JSON.stringify(preferences));
}

async function readCachedPreferences(): Promise<NotificationPreferences | null> {
  const stored = await getItemAsync(PREFS_STORAGE_KEY);
  if (!stored) return null;
  try {
    return normalizeNotificationPreferences(JSON.parse(stored));
  } catch {
    return null;
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

/**
 * Load push prefs. Server is authoritative when GET succeeds.
 * SecureStore is a cache; on GET failure use cache then defaults.
 * 404 (old self-hosted without prefs API) falls through to cache/defaults.
 */
export async function fetchNotificationPreferences(): Promise<NotificationPreferences> {
  try {
    const response = await apiFetch('/api/mobile/devices/preferences');
    if (response.ok) {
      const parsed = normalizeNotificationPreferences(await response.json());
      await cachePreferences(parsed);
      return parsed;
    }
    if (response.status !== 404) {
      console.warn(`Failed to fetch preferences (${response.status}), using cache/defaults`);
    }
  } catch (error) {
    console.warn('Failed to fetch preferences from backend, using cache/defaults:', error);
  }

  const cached = await readCachedPreferences();
  if (cached) return cached;
  return { ...DEFAULT_NOTIFICATION_PREFERENCES };
}

/**
 * Persist prefs. When the prefs API is reachable, PUT must succeed or this throws.
 * On 404 (prefs API missing), saves locally only for old instances.
 */
export async function updateNotificationPreferences(
  preferences: NotificationPreferences
): Promise<NotificationPreferences> {
  const next = normalizeNotificationPreferences(preferences);

  const response = await apiFetch('/api/mobile/devices/preferences', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ preferences: next }),
  });

  if (response.ok) {
    const parsed = normalizeNotificationPreferences(await response.json());
    await cachePreferences(parsed);
    return parsed;
  }

  if (response.status === 404) {
    // Old instance without 364 — local-only; send path will not enforce.
    await cachePreferences(next);
    return next;
  }

  throw new Error(
    await readErrorMessage(response, `Failed to save notification preferences (${response.status})`)
  );
}
