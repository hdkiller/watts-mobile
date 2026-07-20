import type {
  InboxNotification,
  NotificationApi,
  NotificationsInbox,
  NotificationsListApi,
} from './types';

function asRecord(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function asString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value : null;
}

function asBoolean(value: unknown): boolean | null {
  return typeof value === 'boolean' ? value : null;
}

function asNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

export function mapNotificationItem(raw: unknown): InboxNotification | null {
  const row = asRecord(raw);
  if (!row) return null;

  const id = asString(row.id);
  const title = asString(row.title);
  const body = asString(row.message) ?? asString(row.body);
  const read = asBoolean(row.read);
  const createdAt = asString(row.createdAt);

  if (!id || !title || !body || read === null || !createdAt) {
    return null;
  }

  return {
    id,
    title,
    body,
    read,
    createdAt,
    link: asString(row.link),
  };
}

export function mapNotificationsList(raw: unknown): NotificationsInbox {
  const payload = asRecord(raw);
  const list = Array.isArray(payload?.notifications)
    ? payload.notifications
    : Array.isArray(raw)
      ? raw
      : [];

  const items = list
    .map(mapNotificationItem)
    .filter((item): item is InboxNotification => item !== null);

  const unreadFromItems = items.filter((item) => !item.read).length;
  const unreadCount = asNumber(payload?.unreadCount) ?? unreadFromItems;

  return {
    items,
    unreadCount,
    total: asNumber(payload?.total) ?? items.length,
    page: asNumber(payload?.page) ?? 1,
    totalPages: asNumber(payload?.totalPages) ?? 1,
  };
}

export function mapNotificationsListApi(api: NotificationsListApi): NotificationsInbox {
  return mapNotificationsList(api);
}

export function mapNotificationApi(api: NotificationApi): InboxNotification | null {
  return mapNotificationItem(api);
}

/** Relative up to 7 days, then locale short date (matches activity list style). */
export function formatNotificationTime(iso: string, nowMs = Date.now()): string {
  const ms = Date.parse(iso);
  if (!Number.isFinite(ms)) return '';
  const deltaSec = Math.round((nowMs - ms) / 1000);
  if (deltaSec < 60) return 'Just now';
  if (deltaSec < 3600) return `${Math.floor(deltaSec / 60)}m ago`;
  if (deltaSec < 86_400) return `${Math.floor(deltaSec / 3600)}h ago`;
  if (deltaSec < 86_400 * 7) return `${Math.floor(deltaSec / 86_400)}d ago`;
  return new Date(ms).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

/** Mark consecutive same-title (+ same link) rows so the UI can de-emphasize repeats. */
export function markNotificationRepeats(
  items: InboxNotification[]
): Array<InboxNotification & { isRepeat: boolean }> {
  return items.map((item, index) => {
    const prev = items[index - 1];
    const isRepeat = Boolean(
      prev && prev.title === item.title && (prev.link ?? null) === (item.link ?? null)
    );
    return { ...item, isRepeat };
  });
}
