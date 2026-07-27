/* Hallmark · genre: modern-minimal · design-system: docs/DESIGN.md · designed-as-app */
import { router, Stack, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Platform, Pressable, RefreshControl, Text, View } from 'react-native';
import { FadeInDown } from 'react-native-reanimated';

import { friendlyError } from '@/src/api/errors';
import { AnimatedPressable } from '@/src/components/AnimatedPressable';
import { AppSymbol } from '@/src/components/AppSymbol';
import { OfflineBanner } from '@/src/components/OfflineBanner';
import { ListSkeleton } from '@/src/components/Skeleton';
import { SportIcon } from '@/src/components/SportIcon';
import { formatActivityDate, formatDuration } from '@/src/features/activity/mapActivity';
import { buildComplianceIndex, type ComplianceMark } from '@/src/features/activity/compliance';
import { ComplianceMarkView } from '@/src/features/activity/ComplianceMark';
import type { ActivityListItem } from '@/src/features/activity/types';
import {
  useRecentActivityQuery,
  useUpcomingPlannedQuery,
} from '@/src/features/activity/useActivity';
import { useOfflineCached } from '@/src/hooks/useOfflineCached';
import { humanizeWorkoutType } from '@/src/lib/humanizeWorkoutType';
import { APP_HREFS } from '@/src/linking/appHrefs';
import { useThemeColors } from '@/src/theme/useThemeColors';

/** Root-stack lists opened from tabs/deep links often omit the native back chevron. */
function goBackFromActivityList() {
  if (router.canGoBack()) {
    router.back();
    return;
  }
  router.replace(APP_HREFS.today as Href);
}

function statusColor(kind: ActivityListItem['status']['kind']): string {
  switch (kind) {
    case 'ready':
      return 'text-success';
    case 'processing':
      return 'text-modify';
    case 'failed':
      return 'text-danger';
    default:
      return 'text-text-muted';
  }
}

function ActivityRow({
  item,
  index,
  mark,
}: {
  item: ActivityListItem;
  index: number;
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
    <AnimatedPressable
      // Stagger only the initially visible rows; rows mounted while scrolling appear immediately.
      entering={FadeInDown.duration(250).delay(index < 10 ? index * 45 : 0)}
      className="mb-3 rounded-xl border border-border bg-card/80 px-4 py-3.5"
      onPress={() => router.push(APP_HREFS.activityDetail(item.id) as Href)}
    >
      <View className="flex-row items-center gap-3">
        <SportIcon type={item.type} size={14} />
        <View className="min-w-0 flex-1">
          <View className="flex-row items-start justify-between gap-3">
            <View className="min-w-0 flex-1 flex-row items-center">
              <Text className="shrink text-base font-semibold text-text-primary" numberOfLines={1}>
                {item.title}
              </Text>
              <ComplianceMarkView mark={mark} />
            </View>
            <Text className={`text-xs font-medium ${statusColor(item.status.kind)}`}>
              {item.status.label}
            </Text>
          </View>
          {meta ? <Text className="mt-1.5 text-sm text-text-muted">{meta}</Text> : null}
        </View>
      </View>
    </AnimatedPressable>
  );
}

export default function RecentActivityScreen() {
  const theme = useThemeColors();
  const { data, isLoading, isError, error, refetch, dataUpdatedAt } = useRecentActivityQuery();
  const upcoming = useUpcomingPlannedQuery();
  const { showCachedOffline, lastUpdatedLabel } = useOfflineCached({
    data,
    isError,
    dataUpdatedAt,
  });
  const compliance = useMemo(
    () => buildComplianceIndex(data, upcoming.data),
    [data, upcoming.data],
  );

  const [manualRefreshing, setManualRefreshing] = useState(false);
  const handleRefresh = async () => {
    setManualRefreshing(true);
    try {
      await refetch();
    } finally {
      setManualRefreshing(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Recent activity',
          headerShown: true,
          headerLeft: () => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Back"
              hitSlop={12}
              onPress={goBackFromActivityList}
              style={{
                minWidth: 44,
                minHeight: 44,
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: Platform.OS === 'ios' ? -6 : 0,
              }}
            >
              <AppSymbol sf="chevron.left" size={22} tintColor={theme.textPrimary} fallback="←" />
            </Pressable>
          ),
        }}
      />
      {isLoading && !data ? (
        <ListSkeleton />
      ) : isError && !data ? (
        <View className="flex-1 bg-surface px-6 pt-6">
          <View className="rounded-xl border border-danger/40 bg-tint-error p-4">
            <Text className="text-base text-danger">
              {friendlyError(error, 'Failed to load recent activity')}
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
          data={data ?? []}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={manualRefreshing}
              onRefresh={() => void handleRefresh()}
              tintColor={theme.brandOnSurface}
            />
          }
          ListHeaderComponent={
            <OfflineBanner visible={showCachedOffline} lastUpdatedLabel={lastUpdatedLabel} />
          }
          ListEmptyComponent={
            <View className="pt-8">
              <Text className="text-base text-text-muted">
                No recent workouts yet. Completed activities will show up here.
              </Text>
            </View>
          }
          renderItem={({ item, index }) => (
            <ActivityRow item={item} index={index} mark={compliance.forActivity.get(item.id)} />
          )}
        />
      )}
    </>
  );
}
