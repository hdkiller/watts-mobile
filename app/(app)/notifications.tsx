import { Stack, type Href, router } from 'expo-router';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from 'react-native';

import { friendlyError } from '@/src/api/errors';
import { resolvePushOpen } from '@/src/features/notifications/resolvePushOpen';
import type { InboxNotification } from '@/src/features/notifications/types';
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotificationsQuery,
} from '@/src/features/notifications/useNotifications';
import { Colors } from '@/src/theme/colors';

function formatRelativeTime(iso: string): string {
  const ms = Date.parse(iso);
  if (!Number.isFinite(ms)) return '';
  const deltaSec = Math.round((Date.now() - ms) / 1000);
  if (deltaSec < 60) return 'Just now';
  if (deltaSec < 3600) return `${Math.floor(deltaSec / 60)}m ago`;
  if (deltaSec < 86_400) return `${Math.floor(deltaSec / 3600)}h ago`;
  if (deltaSec < 86_400 * 7) return `${Math.floor(deltaSec / 86_400)}d ago`;
  try {
    return new Date(ms).toLocaleDateString();
  } catch {
    return '';
  }
}

function openNotificationLink(link: string | null) {
  if (!link) return;
  const resolved = resolvePushOpen({ path: link });
  if (resolved.kind === 'app') {
    router.push(resolved.href as Href);
  }
}

function NotificationRow({
  item,
  onOpen,
}: {
  item: InboxNotification;
  onOpen: (item: InboxNotification) => void;
}) {
  return (
    <Pressable
      className={`mb-3 rounded-xl border px-4 py-3.5 active:opacity-80 ${
        item.read ? 'border-zinc-800 bg-zinc-900/50' : 'border-zinc-700 bg-zinc-900/90'
      }`}
      onPress={() => onOpen(item)}
    >
      <View className="flex-row items-start justify-between gap-3">
        <Text
          className={`flex-1 text-base ${item.read ? 'font-medium text-zinc-300' : 'font-semibold text-white'}`}
        >
          {item.title}
        </Text>
        {!item.read ? <View className="mt-1.5 h-2 w-2 rounded-full bg-brand" /> : null}
      </View>
      <Text className="mt-1.5 text-sm text-ink-muted" numberOfLines={3}>
        {item.body}
      </Text>
      {formatRelativeTime(item.createdAt) ? (
        <Text className="mt-2 text-xs text-zinc-500">{formatRelativeTime(item.createdAt)}</Text>
      ) : null}
    </Pressable>
  );
}

export default function NotificationsScreen() {
  const { data, isLoading, isError, error, refetch, isRefetching } = useNotificationsQuery();
  const markOne = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();

  const unreadCount = data?.unreadCount ?? 0;

  const onOpen = (item: InboxNotification) => {
    if (!item.read) {
      markOne.mutate(item.id);
    }
    openNotificationLink(item.link);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Notifications',
          headerShown: true,
          headerRight:
            unreadCount > 0
              ? () => (
                  <Pressable
                    onPress={() => markAll.mutate()}
                    disabled={markAll.isPending}
                    className="px-1 active:opacity-70"
                  >
                    <Text className="text-sm font-medium text-brand">
                      {markAll.isPending ? '…' : 'Mark all'}
                    </Text>
                  </Pressable>
                )
              : undefined,
        }}
      />
      {isLoading && !data ? (
        <View className="flex-1 items-center justify-center bg-surface-dark">
          <ActivityIndicator color={Colors.brand} size="large" />
        </View>
      ) : isError ? (
        <View className="flex-1 bg-surface-dark px-6 pt-6">
          <Text className="text-red-400">
            {friendlyError(error, 'Failed to load notifications')}
          </Text>
          <Pressable className="mt-4" hitSlop={8} onPress={() => void refetch()}>
            <Text className="text-sm font-medium text-brand">Try again</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          className="flex-1 bg-surface-dark"
          contentContainerClassName="px-6 pb-10 pt-4"
          data={data?.items ?? []}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => void refetch()}
              tintColor={Colors.brand}
            />
          }
          ListEmptyComponent={
            <View className="pt-8">
              <Text className="text-base text-ink-muted">
                No notifications yet. When a recommendation or analysis is ready, it will show up
                here.
              </Text>
            </View>
          }
          renderItem={({ item }) => <NotificationRow item={item} onOpen={onOpen} />}
        />
      )}
    </>
  );
}
