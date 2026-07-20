import { router, type Href } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';

import {
  formatActivityDate,
  formatDuration,
} from '@/src/features/activity/mapActivity';
import { SportIcon } from '@/src/components/SportIcon';
import { humanizeWorkoutType } from '@/src/lib/humanizeWorkoutType';
import type { PlannedListItem } from '@/src/features/activity/types';
import { useUpcomingPlannedQuery } from '@/src/features/activity/useActivity';
import { pickNextEvent } from '@/src/features/events/mapEvents';
import { useUpcomingEventsQuery } from '@/src/features/events/useEvents';
import { localDateKey } from '@/src/features/today/weekGlance';

const TEASER_LIMIT = 3;

type ComingUpStripProps = {
  /** Planned workout already shown in Today’s hero — omit from the teaser. */
  excludePlannedId?: string | null;
};

function isOnOrAfterToday(date: string | null): boolean {
  const key = localDateKey(date);
  const today = localDateKey(new Date());
  if (!key || !today) return false;
  return key >= today;
}

export function ComingUpStrip({ excludePlannedId }: ComingUpStripProps) {
  const { data, isError } = useUpcomingPlannedQuery();
  const eventsQuery = useUpcomingEventsQuery();
  const nextEvent = pickNextEvent(eventsQuery.data);

  const rows = useMemo(
    () =>
      (data ?? [])
        .filter((item) => isOnOrAfterToday(item.date))
        .filter((item) => !excludePlannedId || item.id !== excludePlannedId)
        .slice(0, TEASER_LIMIT),
    [data, excludePlannedId]
  );

  if (isError) return null;

  return (
    <View className="mt-8">
      <View className="flex-row items-baseline justify-between">
        <Text className="text-xs font-semibold uppercase tracking-widest text-text-muted">
          Coming up
        </Text>
        <Pressable
          className="py-1 active:opacity-70"
          hitSlop={8}
          onPress={() => router.push('/(app)/(tabs)/today/upcoming' as Href)}
        >
          <Text className="text-sm font-semibold text-brand">See all</Text>
        </Pressable>
      </View>

      {rows.length === 0 ? (
        <Text className="mt-3 text-sm text-text-muted">No upcoming planned workouts.</Text>
      ) : (
        <View className="mt-2">
          {rows.map((item) => (
            <ComingUpRow key={item.id} item={item} />
          ))}
        </View>
      )}

      {nextEvent ? (
        <Text className="mt-3 text-sm text-text-muted" numberOfLines={1}>
          Next event: {nextEvent.title} — {nextEvent.countdownLabel}
        </Text>
      ) : null}
    </View>
  );
}

function ComingUpRow({ item }: { item: PlannedListItem }) {
  const meta = [
    formatActivityDate(item.date),
    humanizeWorkoutType(item.type),
    formatDuration(item.durationSec),
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <Pressable
      className="flex-row items-center gap-3 border-b border-border/80 py-3 active:opacity-80"
      onPress={() => router.push(`/(app)/(tabs)/today/planned/${item.id}` as Href)}
    >
      <SportIcon type={item.type} size={13} />
      <View className="min-w-0 flex-1">
        <Text className="text-base font-medium text-text-primary" numberOfLines={1}>
          {item.title}
        </Text>
        {meta ? <Text className="mt-1 text-sm text-text-muted">{meta}</Text> : null}
      </View>
    </Pressable>
  );
}
