import { router, Stack, type Href } from 'expo-router';
import {
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from 'react-native';
import { FadeInDown } from 'react-native-reanimated';

import { friendlyError } from '@/src/api/errors';
import { AnimatedPressable } from '@/src/components/AnimatedPressable';
import { ListSkeleton } from '@/src/components/Skeleton';
import { SportIcon } from '@/src/components/SportIcon';
import {
  formatActivityDate,
  formatDuration,
} from '@/src/features/activity/mapActivity';
import type { ActivityListItem } from '@/src/features/activity/types';
import { useRecentActivityQuery } from '@/src/features/activity/useActivity';
import { Colors } from '@/src/theme/colors';

function statusColor(kind: ActivityListItem['status']['kind']): string {
  switch (kind) {
    case 'ready':
      return 'text-emerald-400';
    case 'processing':
      return 'text-amber-300';
    case 'failed':
      return 'text-red-400';
    default:
      return 'text-ink-muted';
  }
}

function ActivityRow({ item, index }: { item: ActivityListItem; index: number }) {
  const meta = [
    formatActivityDate(item.date),
    item.type,
    formatDuration(item.durationSec),
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <AnimatedPressable
      // Stagger only the initially visible rows; rows mounted while scrolling appear immediately.
      entering={FadeInDown.duration(250).delay(index < 10 ? index * 45 : 0)}
      className="mb-3 rounded-xl border border-zinc-800 bg-zinc-900/80 px-4 py-3.5"
      onPress={() => router.push(`/(app)/activity/${item.id}` as Href)}
    >
      <View className="flex-row items-center gap-3">
        <SportIcon type={item.type} size={14} />
        <View className="min-w-0 flex-1">
          <View className="flex-row items-start justify-between gap-3">
            <Text className="flex-1 text-base font-semibold text-white">{item.title}</Text>
            <Text className={`text-xs font-medium ${statusColor(item.status.kind)}`}>
              {item.status.label}
            </Text>
          </View>
          {meta ? <Text className="mt-1.5 text-sm text-ink-muted">{meta}</Text> : null}
        </View>
      </View>
    </AnimatedPressable>
  );
}

export default function RecentActivityScreen() {
  const { data, isLoading, isError, error, refetch, isRefetching } = useRecentActivityQuery();

  return (
    <>
      <Stack.Screen options={{ title: 'Recent activity', headerShown: true }} />
      {isLoading && !data ? (
        <ListSkeleton />
      ) : isError ? (
        <View className="flex-1 bg-surface-dark px-6 pt-6">
          <Text className="text-red-400">
            {friendlyError(error, 'Failed to load recent activity')}
          </Text>
          <Pressable className="mt-4" hitSlop={8} onPress={() => void refetch()}>
            <Text className="text-sm font-medium text-brand">Try again</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          className="flex-1 bg-surface-dark"
          contentContainerClassName="px-6 pb-10 pt-4"
          data={data ?? []}
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
                No recent workouts yet. Completed activities will show up here.
              </Text>
            </View>
          }
          renderItem={({ item, index }) => <ActivityRow item={item} index={index} />}
        />
      )}
    </>
  );
}
