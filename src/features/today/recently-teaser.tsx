import { router, type Href } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import {
  formatActivityDate,
  formatDuration,
} from '@/src/features/activity/mapActivity';
import type { ActivityListItem } from '@/src/features/activity/types';
import { useRecentActivityQuery } from '@/src/features/activity/useActivity';

const TEASER_LIMIT = 2;

export function RecentlyTeaser() {
  const { data, isError } = useRecentActivityQuery();

  if (isError) return null;

  const rows = (data ?? []).slice(0, TEASER_LIMIT);

  return (
    <View className="mt-8">
      <View className="flex-row items-baseline justify-between">
        <Text className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
          Recently
        </Text>
        <Pressable
          className="py-1 active:opacity-70"
          onPress={() => router.push('/(app)/activity' as Href)}
        >
          <Text className="text-sm font-semibold text-brand">See all</Text>
        </Pressable>
      </View>

      {rows.length === 0 ? (
        <Text className="mt-3 text-sm text-ink-muted">No recent workouts yet.</Text>
      ) : (
        <View className="mt-2">
          {rows.map((item) => (
            <RecentRow key={item.id} item={item} />
          ))}
        </View>
      )}
    </View>
  );
}

function RecentRow({ item }: { item: ActivityListItem }) {
  const meta = [
    formatActivityDate(item.date),
    item.type,
    formatDuration(item.durationSec),
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <Pressable
      className="border-b border-zinc-800/80 py-3 active:opacity-80"
      onPress={() => router.push(`/(app)/activity/${item.id}` as Href)}
    >
      <View className="flex-row items-start justify-between gap-3">
        <Text className="flex-1 text-base font-medium text-white" numberOfLines={1}>
          {item.title}
        </Text>
        <Text className="text-xs text-ink-muted">{item.status.label}</Text>
      </View>
      {meta ? <Text className="mt-1 text-sm text-ink-muted">{meta}</Text> : null}
    </Pressable>
  );
}
