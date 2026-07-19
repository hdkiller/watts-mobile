import { describe, expect, it } from 'vitest';

import { mapNotificationItem, mapNotificationsList } from '../mapNotifications';

describe('mapNotificationItem', () => {
  it('maps title/message/read/createdAt', () => {
    expect(
      mapNotificationItem({
        id: 'n1',
        title: 'Ready',
        message: 'Your recommendation is ready',
        read: false,
        createdAt: '2026-07-19T10:00:00.000Z',
        link: '/',
      })
    ).toEqual({
      id: 'n1',
      title: 'Ready',
      body: 'Your recommendation is ready',
      read: false,
      createdAt: '2026-07-19T10:00:00.000Z',
      link: '/',
    });
  });

  it('accepts body as an alias for message', () => {
    expect(
      mapNotificationItem({
        id: 'n2',
        title: 'Sync',
        body: 'Sync finished',
        read: true,
        createdAt: '2026-07-19T11:00:00.000Z',
      })
    ).toMatchObject({ body: 'Sync finished', read: true, link: null });
  });

  it('returns null for incomplete rows', () => {
    expect(mapNotificationItem({ id: 'x', title: 'Nope' })).toBeNull();
    expect(mapNotificationItem(null)).toBeNull();
  });
});

describe('mapNotificationsList', () => {
  it('maps list payload and unreadCount', () => {
    const inbox = mapNotificationsList({
      notifications: [
        {
          id: 'a',
          title: 'One',
          message: 'First',
          read: false,
          createdAt: '2026-07-19T10:00:00.000Z',
        },
        {
          id: 'b',
          title: 'Two',
          message: 'Second',
          read: true,
          createdAt: '2026-07-19T09:00:00.000Z',
        },
      ],
      total: 2,
      page: 1,
      limit: 50,
      totalPages: 1,
      unreadCount: 1,
    });

    expect(inbox.items).toHaveLength(2);
    expect(inbox.unreadCount).toBe(1);
    expect(inbox.total).toBe(2);
  });

  it('derives unreadCount from items when API omits it', () => {
    const inbox = mapNotificationsList({
      notifications: [
        {
          id: 'a',
          title: 'One',
          message: 'First',
          read: false,
          createdAt: '2026-07-19T10:00:00.000Z',
        },
        {
          id: 'b',
          title: 'Two',
          message: 'Second',
          read: false,
          createdAt: '2026-07-19T09:00:00.000Z',
        },
      ],
    });
    expect(inbox.unreadCount).toBe(2);
  });

  it('handles empty list', () => {
    expect(mapNotificationsList({ notifications: [], unreadCount: 0 }).items).toEqual([]);
  });
});
