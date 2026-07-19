import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from './api';
import type { NotificationsInbox } from './types';

export const NOTIFICATIONS_QUERY_KEY = ['notifications', 'inbox'] as const;

export function useNotificationsQuery() {
  return useQuery({
    queryKey: NOTIFICATIONS_QUERY_KEY,
    queryFn: () => fetchNotifications({ limit: 50, page: 1 }),
  });
}

export function useUnreadNotificationsCount(): number {
  const { data } = useNotificationsQuery();
  return data?.unreadCount ?? 0;
}

function markLocalRead(
  current: NotificationsInbox | undefined,
  id: string
): NotificationsInbox | undefined {
  if (!current) return current;
  let changed = false;
  const items = current.items.map((item) => {
    if (item.id !== id || item.read) return item;
    changed = true;
    return { ...item, read: true };
  });
  if (!changed) return current;
  return {
    ...current,
    items,
    unreadCount: Math.max(0, current.unreadCount - 1),
  };
}

function markLocalAllRead(current: NotificationsInbox | undefined): NotificationsInbox | undefined {
  if (!current) return current;
  return {
    ...current,
    items: current.items.map((item) => (item.read ? item : { ...item, read: true })),
    unreadCount: 0,
  };
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      const previous = queryClient.getQueryData<NotificationsInbox>(NOTIFICATIONS_QUERY_KEY);
      queryClient.setQueryData<NotificationsInbox>(NOTIFICATIONS_QUERY_KEY, (current) =>
        markLocalRead(current, id)
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(NOTIFICATIONS_QUERY_KEY, context.previous);
      }
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => markAllNotificationsRead(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      const previous = queryClient.getQueryData<NotificationsInbox>(NOTIFICATIONS_QUERY_KEY);
      queryClient.setQueryData<NotificationsInbox>(NOTIFICATIONS_QUERY_KEY, markLocalAllRead);
      return { previous };
    },
    onError: (_err, _void, context) => {
      if (context?.previous) {
        queryClient.setQueryData(NOTIFICATIONS_QUERY_KEY, context.previous);
      }
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
    },
  });
}
