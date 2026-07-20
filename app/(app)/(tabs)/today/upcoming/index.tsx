import { router, Stack, type Href } from 'expo-router';
import { useMemo } from 'react';
import {
  Pressable,
  RefreshControl,
  SectionList,
  Text,
  View,
} from 'react-native';

import { friendlyError } from '@/src/api/errors';
import { OfflineBanner } from '@/src/components/OfflineBanner';
import { ListSkeleton } from '@/src/components/Skeleton';
import { SportIcon } from '@/src/components/SportIcon';
import { formatDuration } from '@/src/features/activity/mapActivity';
import { buildComplianceIndex, type ComplianceMark } from '@/src/features/activity/compliance';
import { ComplianceMarkView } from '@/src/features/activity/ComplianceMark';
import { groupUpcomingByDay } from '@/src/features/activity/groupUpcoming';
import type { PlannedListItem } from '@/src/features/activity/types';
import {
  useRecentActivityQuery,
  useUpcomingPlannedQuery,
} from '@/src/features/activity/useActivity';
import { useOfflineCached } from '@/src/hooks/useOfflineCached';
import { humanizeWorkoutType } from '@/src/lib/humanizeWorkoutType';
import { Colors } from '@/src/theme/colors';

function PlannedRow({
  item,
  mark,
}: {
  item: PlannedListItem;
  mark: ComplianceMark | undefined;
}) {
  // Date lives in the section header — keep type · duration · TSS only.
  const meta = [
    humanizeWorkoutType(item.type),
    formatDuration(item.durationSec),
    item.tss != null ? `TSS ${Math.round(item.tss)}` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <Pressable
      className="mb-3 rounded-xl border border-border bg-card/80 px-4 py-3.5 active:opacity-80"
      onPress={() => router.push(`/(app)/(tabs)/today/planned/${item.id}` as Href)}
    >
      <View className="flex-row items-center gap-3">
        <SportIcon type={item.type} size={14} />
        <View className="min-w-0 flex-1">
          <View className="flex-row items-center">
            <Text className="shrink text-base font-semibold text-text-primary" numberOfLines={1}>
              {item.title}
            </Text>
            <ComplianceMarkView mark={mark} />
          </View>
          {meta ? <Text className="mt-1.5 text-sm text-text-muted">{meta}</Text> : null}
        </View>
      </View>
    </Pressable>
  );
}

export default function UpcomingPlannedScreen() {
  const { data, isLoading, isError, error, refetch, isRefetching, dataUpdatedAt } =
    useUpcomingPlannedQuery();
  const recent = useRecentActivityQuery();
  const { showCachedOffline, lastUpdatedLabel } = useOfflineCached({
    data,
    isError,
    dataUpdatedAt,
  });
  const futurePlanned = useMemo(
    () =>
      (data ?? []).filter((item) => {
        const key = item.date ? new Date(item.date) : null;
        if (!key || Number.isNaN(key.getTime())) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const day = new Date(key);
        day.setHours(0, 0, 0, 0);
        return day.getTime() >= today.getTime();
      }),
    [data]
  );
  const sections = useMemo(() => groupUpcomingByDay(futurePlanned), [futurePlanned]);
  const compliance = useMemo(
    () => buildComplianceIndex(recent.data, data),
    [recent.data, data]
  );

  return (
    <>
      <Stack.Screen options={{ title: 'Upcoming', headerShown: true }} />
      {isLoading && !data ? (
        <ListSkeleton />
      ) : isError && !data ? (
        <View className="flex-1 bg-surface px-6 pt-6">
          <Text className="text-red-400">
            {friendlyError(error, 'Failed to load upcoming workouts')}
          </Text>
          <Pressable className="mt-4" hitSlop={8} onPress={() => void refetch()}>
            <Text className="text-sm font-medium text-brand">Try again</Text>
          </Pressable>
        </View>
      ) : (
        <SectionList
          className="flex-1 bg-surface"
          contentContainerClassName="px-6 pb-10 pt-4"
          sections={sections}
          keyExtractor={(item) => item.id}
          stickySectionHeadersEnabled={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => void refetch()}
              tintColor={Colors.brand}
            />
          }
          ListHeaderComponent={
            <OfflineBanner visible={showCachedOffline} lastUpdatedLabel={lastUpdatedLabel} />
          }
          ListEmptyComponent={
            <View className="pt-8">
              <Text className="text-base text-text-muted">
                No upcoming planned workouts in the next two weeks.
              </Text>
            </View>
          }
          renderSectionHeader={({ section }) => (
            <Text className="mb-2 mt-4 text-xs font-semibold uppercase tracking-widest text-text-muted">
              {section.title}
            </Text>
          )}
          renderItem={({ item }) => (
            <PlannedRow item={item} mark={compliance.forPlanned.get(item.id)} />
          )}
        />
      )}
    </>
  );
}
