/* Hallmark · genre: modern-minimal · macrostructure: Workbench · design-system: docs/DESIGN.md · designed-as-app
 * Goal detail — Event-style hairline fields + progress tiles.
 */
import { router, Stack, useLocalSearchParams, type Href } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';

import { friendlyError } from '@/src/api/errors';
import { useAuth } from '@/src/auth/AuthContext';
import { AnimatedPressable } from '@/src/components/AnimatedPressable';
import { AppSymbol } from '@/src/components/AppSymbol';
import { Button } from '@/src/components/Button';
import { HeroStatTiles, type HeroStat } from '@/src/components/HeroStatTiles';
import { OfflineBanner } from '@/src/components/OfflineBanner';
import { DetailSkeleton } from '@/src/components/Skeleton';
import { openInstanceWeb } from '@/src/features/account/openInstanceWeb';
import { goalsWebPath } from '@/src/features/goals/mapGoals';
import type { GoalDetail } from '@/src/features/goals/types';
import { useGoalDetailQuery } from '@/src/features/goals/useGoals';
import { useOfflineCached } from '@/src/hooks/useOfflineCached';
import { hapticLight } from '@/src/lib/haptics';
import { APP_HREFS } from '@/src/linking/appHrefs';
import { useThemeColors } from '@/src/theme/useThemeColors';

function progressStats(data: GoalDetail): HeroStat[] {
  const stats: HeroStat[] = [];
  if (data.startValue != null) {
    stats.push({ label: 'Start', value: String(data.startValue) });
  }
  if (data.currentValue != null) {
    stats.push({ label: 'Current', value: String(data.currentValue) });
  }
  if (data.targetValue != null) {
    stats.push({ label: 'Target', value: String(data.targetValue) });
  }
  return stats.slice(0, 3);
}

export default function GoalDetailScreen() {
  const params = useLocalSearchParams<{ id: string | string[] }>();
  const goalId = Array.isArray(params.id) ? params.id[0] : params.id;
  const theme = useThemeColors();
  const { instanceUrl } = useAuth();
  const { data, isPending, isError, error, refetch, dataUpdatedAt, isFetching, isFetched } =
    useGoalDetailQuery(goalId);
  const { showCachedOffline, lastUpdatedLabel } = useOfflineCached({
    data,
    isError,
    dataUpdatedAt,
  });

  const openWeb = async () => {
    await openInstanceWeb(instanceUrl, goalsWebPath());
  };

  const showSkeleton = Boolean(goalId) && (isPending || isFetching) && !data && !isError;
  const showMissing =
    !goalId ||
    (Boolean(goalId) && isFetched && !isFetching && !isPending && !isError && !data);

  return (
    <>
      <Stack.Screen options={{ title: 'Goal', headerShown: true }} />
      {showSkeleton ? (
        <DetailSkeleton />
      ) : isError && !data ? (
        <View className="flex-1 bg-surface px-6 pt-6">
          <Text className="text-red-400">{friendlyError(error, 'Failed to load goal')}</Text>
          <AnimatedPressable className="mt-4" hitSlop={8} onPress={() => void refetch()}>
            <Text className="text-sm font-semibold text-brand">Try again</Text>
          </AnimatedPressable>
        </View>
      ) : showMissing ? (
        <View className="flex-1 bg-surface px-6 pt-6">
          <Text className="text-base text-text-muted">This goal was not found.</Text>
          <AnimatedPressable
            className="mt-4"
            hitSlop={8}
            onPress={() => router.replace(APP_HREFS.goalsList as Href)}
          >
            <Text className="text-sm font-semibold text-brand">Back to Goals</Text>
          </AnimatedPressable>
        </View>
      ) : data ? (
        <ScrollView className="flex-1 bg-surface" contentContainerClassName="px-6 pb-10 pt-4">
          <OfflineBanner visible={showCachedOffline} lastUpdatedLabel={lastUpdatedLabel} />

          <Text className="text-xs font-semibold uppercase tracking-widest text-text-muted">
            {data.typeLabel}
          </Text>
          <Text className="mt-2 text-2xl font-bold text-text-primary">{data.title}</Text>

          <View className="mt-2 flex-row flex-wrap items-center gap-2">
            {data.statusLabel ? (
              <Text className="text-sm text-text-muted">{data.statusLabel}</Text>
            ) : null}
            {data.priorityLabel ? (
              <View className="rounded-md border border-border bg-card px-2 py-0.5">
                <Text className="text-xs font-semibold uppercase text-text-body">
                  Priority {data.priorityLabel}
                </Text>
              </View>
            ) : null}
          </View>

          <HeroStatTiles stats={progressStats(data)} />

          {data.targetDateLabel ? (
            <View className="mt-6">
              <Text className="text-xs font-semibold uppercase tracking-widest text-text-muted">
                Target date
              </Text>
              <Text className="mt-2 text-base text-text-body">{data.targetDateLabel}</Text>
            </View>
          ) : null}

          {data.metric ? (
            <View className="mt-6">
              <Text className="text-xs font-semibold uppercase tracking-widest text-text-muted">
                Metric
              </Text>
              <Text className="mt-2 text-base text-text-body">{data.metric}</Text>
            </View>
          ) : null}

          {data.description ? (
            <View className="mt-6">
              <Text className="text-xs font-semibold uppercase tracking-widest text-text-muted">
                Description
              </Text>
              <Text className="mt-2 text-base leading-6 text-text-body">{data.description}</Text>
            </View>
          ) : null}

          {data.linkedEvents.length > 0 ? (
            <View className="mt-6">
              <Text className="mb-2 text-xs font-semibold uppercase tracking-widest text-text-muted">
                Linked events
              </Text>
              {data.linkedEvents.map((event) => (
                <AnimatedPressable
                  key={event.id}
                  accessibilityRole="button"
                  accessibilityLabel={event.title}
                  className="flex-row items-center gap-3 border-b border-border/80 py-3"
                  onPress={() => {
                    hapticLight();
                    router.push(APP_HREFS.eventDetail(event.id) as Href);
                  }}
                >
                  <View className="min-w-0 flex-1">
                    <Text className="text-base font-medium text-text-primary">{event.title}</Text>
                    {event.dateLabel ? (
                      <Text className="mt-1 text-sm text-text-muted">{event.dateLabel}</Text>
                    ) : null}
                  </View>
                  <AppSymbol
                    sf="chevron.right"
                    size={14}
                    tintColor={theme.textMuted}
                    fallback="›"
                  />
                </AnimatedPressable>
              ))}
            </View>
          ) : null}

          <Button
            className="mt-8"
            label="Manage on web"
            variant="secondary"
            onPress={() => void openWeb()}
          />
        </ScrollView>
      ) : null}
    </>
  );
}
