/* Hallmark · genre: modern-minimal · macrostructure: Workbench · design-system: docs/DESIGN.md · designed-as-app */
import { router, type Href } from 'expo-router';
import { useMemo } from 'react';
import { Text, View } from 'react-native';

import { friendlyError } from '@/src/api/errors';
import { AnimatedPressable } from '@/src/components/AnimatedPressable';
import { Skeleton } from '@/src/components/Skeleton';
import {
  useActivityGlancePlannedQuery,
  useActivityGlanceWorkoutsQuery,
} from '@/src/features/activity/useActivity';
import { hapticLight } from '@/src/lib/haptics';
import { APP_HREFS } from '@/src/linking/appHrefs';

import {
  activityGlanceRange,
  computeActivityGlance,
  resolveActivityGlanceTap,
  type ActivityGlanceDay,
} from './activityGlance';

function rangeCaption(startKey: string, endKey: string): string {
  const start = parseLocalDate(startKey);
  const end = parseLocalDate(endKey);
  const startLabel = start.toLocaleDateString(undefined, { month: 'short' });
  const endLabel = end.toLocaleDateString(undefined, { month: 'short' });
  if (startLabel === endLabel) return startLabel;
  return `${startLabel}–${endLabel}`;
}

function parseLocalDate(dateKey: string): Date {
  const [y, m, d] = dateKey.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function ActivityGlanceStrip() {
  const range = useMemo(() => activityGlanceRange(), []);
  const workoutsQuery = useActivityGlanceWorkoutsQuery(range.start, range.end);
  const plannedQuery = useActivityGlancePlannedQuery(range.start, range.end);

  const loading =
    (workoutsQuery.isLoading && !workoutsQuery.data) ||
    (plannedQuery.isLoading && !plannedQuery.data);
  const error = workoutsQuery.error ?? plannedQuery.error;
  const failed =
    (workoutsQuery.isError || plannedQuery.isError) &&
    !workoutsQuery.data &&
    !plannedQuery.data;

  const glance = useMemo(
    () => computeActivityGlance(workoutsQuery.data, plannedQuery.data),
    [workoutsQuery.data, plannedQuery.data]
  );

  const onDayPress = (day: ActivityGlanceDay) => {
    hapticLight();
    const target = resolveActivityGlanceTap(day);
    if (target.kind === 'activity') {
      router.push(APP_HREFS.activityDetail(target.id) as Href);
      return;
    }
    if (target.kind === 'planned') {
      router.push(APP_HREFS.plannedDetail(target.id) as Href);
      return;
    }
    if (target.kind === 'upcoming') {
      router.push(APP_HREFS.upcoming as Href);
      return;
    }
    router.push(APP_HREFS.activityList as Href);
  };

  const onRetry = () => {
    hapticLight();
    void workoutsQuery.refetch();
    void plannedQuery.refetch();
  };

  if (loading) {
    return (
      <View testID="athlete-activity-glance" className="mt-5">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="mt-2 h-4 w-36" />
        <Skeleton className="mt-3 h-24 w-full rounded-xl" />
      </View>
    );
  }

  if (failed) {
    return (
      <View testID="athlete-activity-glance" className="mt-5">
        <Text className="text-xs font-semibold uppercase tracking-widest text-text-muted">
          Activity
        </Text>
        <View className="mt-2 rounded-xl border border-danger/40 bg-tint-error px-4 py-3">
          <Text className="text-sm text-red-400">
            {friendlyError(error, 'Could not load activity glance')}
          </Text>
          <AnimatedPressable
            accessibilityRole="button"
            accessibilityLabel="Retry activity glance"
            className="mt-2 self-start"
            hitSlop={8}
            onPress={onRetry}
          >
            <Text className="text-sm font-semibold text-brand">Retry</Text>
          </AnimatedPressable>
        </View>
      </View>
    );
  }

  const emptyWindow = glance.doneDayCount === 0 && glance.plannedDayCount === 0;

  return (
    <View testID="athlete-activity-glance" className="mt-5">
      <Text className="text-xs font-semibold uppercase tracking-widest text-text-muted">
        Activity
      </Text>
      <Text className="mt-2 text-sm text-text-body" testID="athlete-activity-glance-summary">
        {glance.summaryLine}
        <Text className="text-text-muted"> · {rangeCaption(glance.startKey, glance.endKey)}</Text>
      </Text>
      {emptyWindow ? (
        <Text className="mt-1 text-sm text-text-muted">No sessions in this window.</Text>
      ) : null}

      <View className="mt-3 flex-row justify-between">
        {glance.weeks.map((week) => (
          <View key={week.weekStartKey} className="flex-1 items-center">
            {week.days.map((day) => {
              const fillClass = day.hasDone
                ? 'bg-brand'
                : day.hasPlanned
                  ? 'border border-border-strong bg-transparent'
                  : 'bg-border';
              const a11y = [
                day.dateKey,
                day.hasDone ? 'completed' : null,
                day.hasPlanned ? 'planned' : null,
                day.isToday ? 'today' : null,
              ]
                .filter(Boolean)
                .join(', ');
              return (
                <AnimatedPressable
                  key={day.dateKey}
                  testID={`athlete-activity-glance-day-${day.dateKey}`}
                  accessibilityRole="button"
                  accessibilityLabel={a11y}
                  hitSlop={8}
                  onPress={() => onDayPress(day)}
                  className={`mb-0.5 h-5 w-full max-w-[22px] items-center justify-center self-center rounded-full ${
                    day.isToday ? 'border border-text-primary' : ''
                  }`}
                >
                  <View className={`h-2.5 w-2.5 rounded-full ${fillClass}`} />
                </AnimatedPressable>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}
