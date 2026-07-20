import { router, type Href } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';

import {
  formatActivityDate,
  formatDuration,
} from '@/src/features/activity/mapActivity';
import {
  buildComplianceIndex,
  type ComplianceMark,
} from '@/src/features/activity/compliance';
import { ComplianceMarkView } from '@/src/features/activity/ComplianceMark';
import { SportIcon } from '@/src/components/SportIcon';
import type { ActivityListItem } from '@/src/features/activity/types';
import { humanizeWorkoutType } from '@/src/lib/humanizeWorkoutType';
import {
  useRecentActivityQuery,
  useUpcomingPlannedQuery,
} from '@/src/features/activity/useActivity';

const TEASER_LIMIT = 2;

export function RecentlyTeaser() {
  const { data, isError } = useRecentActivityQuery();
  const upcoming = useUpcomingPlannedQuery();

  const compliance = useMemo(
    () => buildComplianceIndex(data, upcoming.data),
    [data, upcoming.data]
  );

  if (isError) return null;

  const rows = (data ?? []).slice(0, TEASER_LIMIT);

  return (
    <View className="mt-8">
      <View className="flex-row items-baseline justify-between">
        <Text className="text-xs font-semibold uppercase tracking-widest text-text-muted">
          Recently
        </Text>
        <Pressable
          className="py-1 active:opacity-70"
          hitSlop={8}
          onPress={() => router.push('/(app)/(tabs)/today/activity' as Href)}
        >
          <Text className="text-sm font-semibold text-brand">See all</Text>
        </Pressable>
      </View>

      {rows.length === 0 ? (
        <Text className="mt-3 text-sm text-text-muted">No recent workouts yet.</Text>
      ) : (
        <View className="mt-2">
          {rows.map((item) => (
            <RecentRow
              key={item.id}
              item={item}
              mark={compliance.forActivity.get(item.id)}
            />
          ))}
        </View>
      )}
    </View>
  );
}

function RecentRow({
  item,
  mark,
}: {
  item: ActivityListItem;
  mark: ComplianceMark | undefined;
}) {
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
      onPress={() => router.push(`/(app)/(tabs)/today/activity/${item.id}` as Href)}
    >
      <SportIcon type={item.type} size={13} />
      <View className="min-w-0 flex-1">
        <View className="flex-row items-start justify-between gap-3">
          <View className="min-w-0 flex-1 flex-row items-center">
            <Text className="shrink text-base font-medium text-text-primary" numberOfLines={1}>
              {item.title}
            </Text>
            <ComplianceMarkView mark={mark} />
          </View>
          <Text className="text-xs text-text-muted">{item.status.label}</Text>
        </View>
        {meta ? <Text className="mt-1 text-sm text-text-muted">{meta}</Text> : null}
      </View>
    </Pressable>
  );
}
