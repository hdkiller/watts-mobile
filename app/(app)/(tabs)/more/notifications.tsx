import { Stack, type Href, router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  Text,
  View,
} from 'react-native';

import { friendlyError } from '@/src/api/errors';
import {
  formatNotificationTime,
  markNotificationRepeats,
} from '@/src/features/notifications/mapNotifications';
import { resolvePushOpen } from '@/src/features/notifications/resolvePushOpen';
import type { InboxNotification } from '@/src/features/notifications/types';
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotificationsQuery,
} from '@/src/features/notifications/useNotifications';
import { Colors } from '@/src/theme/colors';
import { useThemeColors } from '@/src/theme/useThemeColors';

function goBackToMore() {
  if (router.canGoBack()) {
    router.back();
    return;
  }
  router.replace('/(app)/(tabs)/more' as Href);
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
  item: InboxNotification & { isRepeat: boolean };
  onOpen: (item: InboxNotification) => void;
}) {
  const titleClass = item.isRepeat
    ? 'font-medium text-text-muted'
    : item.read
      ? 'font-medium text-text-body'
      : 'font-semibold text-text-primary';

  return (
    <Pressable
      className={`mb-3 rounded-xl border px-4 py-3.5 active:opacity-80 ${
        item.read || item.isRepeat
          ? 'border-border bg-card/50'
          : 'border-border-strong bg-card/90'
      }`}
      onPress={() => onOpen(item)}
    >
      <View className="flex-row items-start justify-between gap-3">
        <Text className={`flex-1 text-base ${titleClass}`} numberOfLines={2}>
          {item.title}
        </Text>
        {!item.read ? <View className="mt-1.5 h-2 w-2 rounded-full bg-brand" /> : null}
      </View>
      <Text className="mt-1.5 text-sm text-text-muted" numberOfLines={3}>
        {item.body}
      </Text>
      {formatNotificationTime(item.createdAt) ? (
        <Text className="mt-2 text-xs text-text-muted">
          {formatNotificationTime(item.createdAt)}
        </Text>
      ) : null}
    </Pressable>
  );
}

export default function NotificationsScreen() {
  const theme = useThemeColors();
  const { data, isLoading, isError, error, refetch, isRefetching } = useNotificationsQuery();
  const markOne = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();

  const unreadCount = data?.unreadCount ?? 0;
  const rows = useMemo(
    () => markNotificationRepeats(data?.items ?? []),
    [data?.items]
  );

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
          headerLeft: () => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Back"
              hitSlop={8}
              className="mr-1 active:opacity-70"
              onPress={goBackToMore}
            >
              {Platform.OS === 'ios' ? (
                <SymbolView name="chevron.left" size={22} tintColor={theme.textPrimary} />
              ) : (
                <Text style={{ color: theme.textPrimary, fontSize: 22, lineHeight: 24 }}>←</Text>
              )}
            </Pressable>
          ),
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
        <View className="flex-1 items-center justify-center bg-surface">
          <ActivityIndicator color={Colors.brand} size="large" />
        </View>
      ) : isError ? (
        <View className="flex-1 bg-surface px-6 pt-6">
          <Text className="text-red-400">
            {friendlyError(error, 'Failed to load notifications')}
          </Text>
          <Pressable className="mt-4" hitSlop={8} onPress={() => void refetch()}>
            <Text className="text-sm font-medium text-brand">Try again</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          className="flex-1 bg-surface"
          contentContainerClassName="px-6 pb-10 pt-4"
          data={rows}
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
              <Text className="text-base text-text-muted">
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
