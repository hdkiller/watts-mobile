/* Hallmark · genre: modern-minimal · macrostructure: Workbench · design-system: docs/DESIGN.md · designed-as-app */
import { router, type Href } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Text,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';

import { friendlyError } from '@/src/api/errors';
import { AnimatedPressable } from '@/src/components/AnimatedPressable';
import { Skeleton } from '@/src/components/Skeleton';
import {
  useActivityGlancePlannedQuery,
  useActivityGlanceWorkoutsQuery,
} from '@/src/features/activity/useActivity';
import { useNutritionGlanceLoggedDaysQuery } from '@/src/features/nutrition/useNutrition';
import { isNutritionTrackingEnabled } from '@/src/features/profile/mapProfile';
import { useAthleteProfileQuery } from '@/src/features/profile/useProfile';
import { hapticLight } from '@/src/lib/haptics';
import { APP_HREFS } from '@/src/linking/appHrefs';

import {
  activityGlanceRange,
  computeActivityGlance,
  computeNutritionGlance,
  glancePageOffsets,
  resolveActivityGlanceTap,
  type ActivityGlanceDay,
} from './activityGlance';

type GlanceMode = 'activity' | 'nutrition';

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

function ModeSegment({
  mode,
  onChange,
}: {
  mode: GlanceMode;
  onChange: (mode: GlanceMode) => void;
}) {
  return (
    <View testID="athlete-glance-mode" className="flex-row items-center gap-4 self-start">
      {(['activity', 'nutrition'] as const).map((value) => {
        const selected = mode === value;
        const label = value === 'activity' ? 'Activity' : 'Nutrition';
        return (
          <AnimatedPressable
            key={value}
            testID={`athlete-glance-mode-${value}`}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={label}
            hitSlop={8}
            onPress={() => {
              if (value === mode) return;
              hapticLight();
              onChange(value);
            }}
            className="py-1"
          >
            <Text
              className={`text-xs font-semibold ${
                selected ? 'text-text-primary' : 'text-text-muted'
              }`}
            >
              {label}
            </Text>
            <View
              className={`mt-1 h-0.5 w-full rounded-full ${selected ? 'bg-brand' : 'bg-transparent'}`}
            />
          </AnimatedPressable>
        );
      })}
    </View>
  );
}

function ActivityGlancePage({ pageOffset, width }: { pageOffset: number; width: number }) {
  const range = useMemo(() => activityGlanceRange(new Date(), pageOffset), [pageOffset]);
  const workoutsQuery = useActivityGlanceWorkoutsQuery(range.start, range.end);
  const plannedQuery = useActivityGlancePlannedQuery(range.start, range.end);

  const loading =
    (workoutsQuery.isLoading && !workoutsQuery.data) ||
    (plannedQuery.isLoading && !plannedQuery.data);
  const error = workoutsQuery.error ?? plannedQuery.error;
  const failed =
    (workoutsQuery.isError || plannedQuery.isError) && !workoutsQuery.data && !plannedQuery.data;

  const glance = useMemo(
    () => computeActivityGlance(workoutsQuery.data, plannedQuery.data, new Date(), pageOffset),
    [workoutsQuery.data, plannedQuery.data, pageOffset],
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
      <View style={{ width }} className="pr-0">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="mt-3 h-24 w-full rounded-xl" />
      </View>
    );
  }

  if (failed) {
    return (
      <View style={{ width }}>
        <View className="rounded-xl border border-danger/40 bg-tint-error px-4 py-3">
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
    <View style={{ width }} testID={`athlete-activity-glance-page-${pageOffset}`}>
      <Text className="text-sm text-text-muted" testID="athlete-activity-glance-summary">
        {glance.summaryLine}
        {' · '}
        {rangeCaption(glance.startKey, glance.endKey)}
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

function NutritionGlancePage({ pageOffset, width }: { pageOffset: number; width: number }) {
  const range = useMemo(() => activityGlanceRange(new Date(), pageOffset), [pageOffset]);
  const loggedQuery = useNutritionGlanceLoggedDaysQuery(range.startKey, range.endKey);

  const loading = loggedQuery.isLoading && !loggedQuery.data;
  const failed = loggedQuery.isError && !loggedQuery.data;

  const glance = useMemo(
    () => computeNutritionGlance(loggedQuery.data, new Date(), pageOffset),
    [loggedQuery.data, pageOffset],
  );

  const onDayPress = () => {
    hapticLight();
    router.push(APP_HREFS.log as Href);
  };

  if (loading) {
    return (
      <View style={{ width }}>
        <Skeleton className="h-4 w-44" />
        <Skeleton className="mt-3 h-24 w-full rounded-xl" />
      </View>
    );
  }

  if (failed) {
    return (
      <View style={{ width }}>
        <View className="rounded-xl border border-danger/40 bg-tint-error px-4 py-3">
          <Text className="text-sm text-red-400">
            {friendlyError(loggedQuery.error, 'Could not load nutrition glance')}
          </Text>
          <AnimatedPressable
            accessibilityRole="button"
            accessibilityLabel="Retry nutrition glance"
            className="mt-2 self-start"
            hitSlop={8}
            onPress={() => {
              hapticLight();
              void loggedQuery.refetch();
            }}
          >
            <Text className="text-sm font-semibold text-brand">Retry</Text>
          </AnimatedPressable>
        </View>
      </View>
    );
  }

  const emptyWindow = glance.loggedDayCount === 0;

  return (
    <View style={{ width }} testID={`athlete-nutrition-glance-page-${pageOffset}`}>
      <Text className="text-sm text-text-muted" testID="athlete-nutrition-glance-summary">
        {glance.summaryLine}
        {' · '}
        {rangeCaption(glance.startKey, glance.endKey)}
      </Text>
      {emptyWindow ? (
        <Text className="mt-1 text-sm text-text-muted">No nutrition logged in this window.</Text>
      ) : null}
      <View className="mt-3 flex-row justify-between">
        {glance.weeks.map((week) => (
          <View key={week.weekStartKey} className="flex-1 items-center">
            {week.days.map((day) => {
              const fillClass = day.hasLogged
                ? 'bg-brand'
                : day.isFuture
                  ? 'bg-border/60'
                  : 'bg-border';
              const a11y = [
                day.dateKey,
                day.hasLogged ? 'logged' : day.isFuture ? 'upcoming' : 'gap',
                day.isToday ? 'today' : null,
              ]
                .filter(Boolean)
                .join(', ');
              return (
                <AnimatedPressable
                  key={day.dateKey}
                  testID={`athlete-nutrition-glance-day-${day.dateKey}`}
                  accessibilityRole="button"
                  accessibilityLabel={a11y}
                  hitSlop={8}
                  onPress={onDayPress}
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

export function ActivityGlanceStrip() {
  const profileQuery = useAthleteProfileQuery();
  const trackingEnabled = isNutritionTrackingEnabled(profileQuery.data);
  const [mode, setMode] = useState<GlanceMode>('activity');
  const [width, setWidth] = useState(0);
  const pageOffsets = useMemo(() => glancePageOffsets(), []);
  const liveIndex = pageOffsets.length - 1;
  const listRef = useRef<FlatList<number>>(null);
  const [pageIndex, setPageIndex] = useState(liveIndex);

  const effectiveMode: GlanceMode = trackingEnabled ? mode : 'activity';

  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (width <= 0) return;
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    if (index >= 0 && index < pageOffsets.length) setPageIndex(index);
  };

  return (
    <View
      testID="athlete-activity-glance"
      className="mt-5"
      onLayout={(e) => {
        const next = Math.round(e.nativeEvent.layout.width);
        if (next > 0 && next !== width) setWidth(next);
      }}
    >
      {trackingEnabled ? (
        <ModeSegment
          mode={effectiveMode}
          onChange={(next) => {
            setMode(next);
          }}
        />
      ) : (
        <Text className="text-xs font-semibold uppercase tracking-widest text-text-muted">
          Activity
        </Text>
      )}

      {width > 0 ? (
        <View className="mt-2">
          <FlatList
            ref={listRef}
            horizontal
            pagingEnabled
            nestedScrollEnabled
            showsHorizontalScrollIndicator={false}
            data={pageOffsets}
            keyExtractor={(offset) => String(offset)}
            initialScrollIndex={liveIndex}
            getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
            windowSize={3}
            initialNumToRender={1}
            maxToRenderPerBatch={2}
            onMomentumScrollEnd={onScrollEnd}
            renderItem={({ item: pageOffset }) =>
              effectiveMode === 'nutrition' ? (
                <NutritionGlancePage pageOffset={pageOffset} width={width} />
              ) : (
                <ActivityGlancePage pageOffset={pageOffset} width={width} />
              )
            }
          />
          {pageIndex < liveIndex ? (
            <Text className="mt-2 text-center text-xs text-text-muted">Earlier window</Text>
          ) : null}
        </View>
      ) : (
        <View className="mt-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="mt-3 h-24 w-full rounded-xl" />
        </View>
      )}
    </View>
  );
}
