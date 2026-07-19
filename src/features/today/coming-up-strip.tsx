import { router, type Href } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import {
  formatActivityDate,
  formatDuration,
} from '@/src/features/activity/mapActivity';
import { SportIcon } from '@/src/components/SportIcon';
import type { PlannedListItem } from '@/src/features/activity/types';
import { useUpcomingPlannedQuery } from '@/src/features/activity/useActivity';

const TEASER_LIMIT = 3;

type ComingUpStripProps = {
  /** Planned workout already shown in Today’s hero — omit from the teaser. */
  excludePlannedId?: string | null;
};

export function ComingUpStrip({ excludePlannedId }: ComingUpStripProps) {
  const { data, isError } = useUpcomingPlannedQuery();

  if (isError) return null;

  const rows = (data ?? [])
    .filter((item) => !excludePlannedId || item.id !== excludePlannedId)
    .slice(0, TEASER_LIMIT);

  return (
    <View className="mt-8">
      <View className="flex-row items-baseline justify-between">
        <Text className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
          Coming up
        </Text>
        <Pressable
          className="py-1 active:opacity-70"
          hitSlop={8}
          onPress={() => router.push('/(app)/upcoming' as Href)}
        >
          <Text className="text-sm font-semibold text-brand">See all</Text>
        </Pressable>
      </View>

      {rows.length === 0 ? (
        <Text className="mt-3 text-sm text-ink-muted">No upcoming planned workouts.</Text>
      ) : (
        <View className="mt-2">
          {rows.map((item) => (
            <ComingUpRow key={item.id} item={item} />
          ))}
        </View>
      )}
    </View>
  );
}

function ComingUpRow({ item }: { item: PlannedListItem }) {
  const meta = [
    formatActivityDate(item.date),
    item.type,
    formatDuration(item.durationSec),
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <Pressable
      className="flex-row items-center gap-3 border-b border-zinc-800/80 py-3 active:opacity-80"
      onPress={() => router.push(`/(app)/planned/${item.id}` as Href)}
    >
      <SportIcon type={item.type} size={13} />
      <View className="min-w-0 flex-1">
        <Text className="text-base font-medium text-white" numberOfLines={1}>
          {item.title}
        </Text>
        {meta ? <Text className="mt-1 text-sm text-ink-muted">{meta}</Text> : null}
      </View>
    </Pressable>
  );
}
