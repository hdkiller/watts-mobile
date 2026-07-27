/* Hallmark · genre: modern-minimal · design-system: docs/DESIGN.md · designed-as-app */
import { Stack, type Href, router } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, Text, View } from 'react-native';

import { friendlyError } from '@/src/api/errors';
import { AppSymbol } from '@/src/components/AppSymbol';
import { ListSkeleton } from '@/src/components/Skeleton';
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
        item.read || item.isRepeat ? 'border-border bg-card/50' : 'border-border-strong bg-card/90'
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
  const { data, isLoading, isError, error, refetch } = useNotificationsQuery();
  const markOne = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();

  const [manualRefreshing, setManualRefreshing] = useState(false);
  const handleRefresh = async () => {
    setManualRefreshing(true);
    try {
      await refetch();
    } finally {
      setManualRefreshing(false);
    }
  };

  const unreadCount = data?.unreadCount ?? 0;
  const rows = useMemo(() => markNotificationRepeats(data?.items ?? []), [data?.items]);

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
              hitSlop={12}
              onPress={goBackToMore}
              style={{
                minWidth: 44,
                minHeight: 44,
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: -4,
              }}
            >
              <AppSymbol sf="chevron.left" size={20} tintColor={theme.textPrimary} fallback="‹" />
            </Pressable>
          ),
          headerRight: () =>
            unreadCount > 0 ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Mark all as read"
                hitSlop={8}
                disabled={markAll.isPending}
                onPress={() => markAll.mutate()}
              >
                <Text className="text-sm font-medium text-brand">Mark all read</Text>
              </Pressable>
            ) : null,
        }}
      />
      {isLoading && !data ? (
        <ListSkeleton rows={8} />
      ) : isError && !data ? (
        <View className="flex-1 bg-surface px-6 pt-6">
          <View className="rounded-2xl border border-danger/40 bg-tint-error p-4">
            <Text className="text-base text-danger">
              {friendlyError(error, 'Failed to load notifications')}
            </Text>
            <Pressable className="mt-3" hitSlop={8} onPress={() => void refetch()}>
              <Text className="text-sm font-semibold text-brand">Retry</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <FlatList
          className="flex-1 bg-surface"
          contentContainerClassName="px-6 pb-10 pt-4"
          data={rows}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={manualRefreshing}
              onRefresh={() => void handleRefresh()}
              tintColor={theme.brandOnSurface}
            />
          }
          ListEmptyComponent={
            <View className="items-center justify-center px-6 py-16">
              <View className="mb-4 h-14 w-14 items-center justify-center rounded-full bg-border-strong">
                <AppSymbol sf="bell.slash" size={24} tintColor={theme.textMuted} fallback="🔔" />
              </View>
              <Text className="text-center text-base font-semibold text-text-primary">
                No notifications yet
              </Text>
              <Text className="mt-1.5 max-w-xs text-center text-sm leading-5 text-text-muted">
                When a daily recommendation, workout analysis, or coach message is ready, it will
                show up here.
              </Text>
            </View>
          }
          renderItem={({ item }) => <NotificationRow item={item} onOpen={onOpen} />}
        />
      )}
    </>
  );
}
