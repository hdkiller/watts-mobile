import { router, useLocalSearchParams, usePathname, type Href } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-screens/experimental';

import { friendlyError } from '@/src/api/errors';
import { AppSymbol } from '@/src/components/AppSymbol';
import { Button } from '@/src/components/Button';
import { WellnessCheckinSheet } from '@/src/features/log/WellnessCheckinSheet';
import { formFromWellness, formHasContent } from '@/src/features/log/mapLogForm';
import { useTodayWellnessQuery } from '@/src/features/log/useLog';
import { MeasurementSheet } from '@/src/features/measurements/MeasurementSheet';
import { MeasurementsDetailSheet } from '@/src/features/measurements/MeasurementsDetailSheet';
import { useBodyMeasurementsQuery } from '@/src/features/measurements/useMeasurements';
import { HydrationQuickAddSheet } from '@/src/features/nutrition/HydrationQuickAddSheet';
import { LogMealSheet } from '@/src/features/nutrition/LogMealSheet';
import { NutritionDetailSheet } from '@/src/features/nutrition/NutritionDetailSheet';
import { formatMacroGrams, goalProgressPct } from '@/src/features/nutrition/mapNutrition';
import { useTodayNutritionQuery } from '@/src/features/nutrition/useNutrition';
import { isNutritionTrackingEnabled, weightUnit } from '@/src/features/profile/mapProfile';
import { useAthleteProfileQuery } from '@/src/features/profile/useProfile';
import { filterActiveToday } from '@/src/features/recovery/mapRecovery';
import type { RecoveryContextItem } from '@/src/features/recovery/types';
import { useRecoveryContextQuery } from '@/src/features/recovery/useRecovery';
import { useKeyboardOverlap } from '@/src/hooks/useKeyboardOverlap';
import { useTabScrollPadding } from '@/src/hooks/useTabScrollPadding';
import { hapticLight } from '@/src/lib/haptics';
import { Colors } from '@/src/theme/colors';
import { useThemeColors } from '@/src/theme/useThemeColors';

export default function LogScreen() {
  const theme = useThemeColors();
  const params = useLocalSearchParams<{ section?: string; action?: string; t?: string }>();
  const pathname = usePathname();
  const { containerRef, overlap } = useKeyboardOverlap();
  const tabBottomPad = useTabScrollPadding(overlap);

  // Queries
  const { data: athleteProfile } = useAthleteProfileQuery();
  const nutritionEnabled = isNutritionTrackingEnabled(athleteProfile);
  const weightUnitLabel = weightUnit(athleteProfile);

  const { data: todayWellness, isLoading: wellnessLoading } = useTodayWellnessQuery();
  const { data: todayNutrition } = useTodayNutritionQuery();
  const { data: recoveryItems } = useRecoveryContextQuery();
  const { data: measurementsData } = useBodyMeasurementsQuery();

  // Active recovery items for today
  const activeTodayRecovery = useMemo(
    () => (recoveryItems ? filterActiveToday(recoveryItems) : []),
    [recoveryItems]
  );

  // Modal Sheet States
  const [mealSheetOpen, setMealSheetOpen] = useState(false);
  const [hydrationSheetOpen, setHydrationSheetOpen] = useState(false);
  const [wellnessSheetOpen, setWellnessSheetOpen] = useState(false);
  const [measurementSheetOpen, setMeasurementSheetOpen] = useState(false);
  const launchedPhotoTokenRef = useRef<string | null>(null);
  const untokenedCameraBusyRef = useRef(false);

  // Detail Sheet States
  const [nutritionDetailSheetOpen, setNutritionDetailSheetOpen] = useState(
    params.section === 'nutrition' && !params.action
  );
  const [measurementsDetailSheetOpen, setMeasurementsDetailSheetOpen] = useState(
    params.section === 'measurements' && !params.action
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (params.action === 'camera') {
        const launchToken =
          typeof params.t === 'string' && params.t.length > 0 ? params.t : null;

        if (launchToken != null) {
          if (launchedPhotoTokenRef.current === launchToken) return;
          launchedPhotoTokenRef.current = launchToken;
        } else if (untokenedCameraBusyRef.current) {
          return;
        } else {
          untokenedCameraBusyRef.current = true;
        }

        router.setParams({ action: undefined, t: undefined });

        // Match Today: do not open AI photo logging when nutrition tracking is off.
        if (!nutritionEnabled) {
          untokenedCameraBusyRef.current = false;
          return;
        }

        // Avoid stacking multiple fullscreen photo-meal routes.
        if (pathname.includes('photo-meal')) {
          untokenedCameraBusyRef.current = false;
          return;
        }

        router.push('/(app)/(tabs)/log/photo-meal' as Href);
        untokenedCameraBusyRef.current = false;
        return;
      }

      untokenedCameraBusyRef.current = false;

      if (params.action === 'meal') {
        setMealSheetOpen(true);
      } else if (params.action === 'water') {
        setHydrationSheetOpen(true);
      } else if (params.action === 'wellness' || params.section === 'wellness') {
        // Legacy entry points (Today glance, daily check-in) still use ?section=wellness
        setWellnessSheetOpen(true);
      } else if (params.action === 'measurement') {
        setMeasurementSheetOpen(true);
      }
    }, 0);
    return () => clearTimeout(timeout);
  }, [params.action, params.section, params.t, nutritionEnabled, pathname]);

  const wellnessInitialValues = useMemo(
    () =>
      todayWellness ? formFromWellness(todayWellness, athleteProfile?.weightUnits) : undefined,
    [todayWellness, athleteProfile?.weightUnits]
  );

  const isWellnessDone =
    todayWellness != null && formHasContent(formFromWellness(todayWellness));
  const todayDateStr = useMemo(
    () =>
      new Date().toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
      }),
    []
  );

  // Today's Entries Feed Items
  const todayEntries = useMemo(() => {
    const entries: Array<{
      id: string;
      time: string;
      title: string;
      sub: string;
      type: 'wellness' | 'meal' | 'hydration' | 'recovery' | 'measurement';
      actionLabel: string;
      onAction: () => void;
    }> = [];

    if (isWellnessDone && todayWellness) {
      entries.push({
        id: 'wellness-today',
        time: 'Today',
        title: 'Daily Wellness Check-in',
        sub: `Mood ${todayWellness.mood ?? '—'} · Sleep ${todayWellness.sleepHours ?? '—'}h`,
        type: 'wellness',
        actionLabel: 'Edit',
        onAction: () => setWellnessSheetOpen(true),
      });
    }

    if (todayNutrition && todayNutrition.waterMl > 0) {
      entries.push({
        id: 'hydration-today',
        time: 'Today',
        title: 'Water Hydration',
        sub: `${todayNutrition.waterMl} ml logged`,
        type: 'hydration',
        actionLabel: 'Add More',
        onAction: () => setHydrationSheetOpen(true),
      });
    }

    if (activeTodayRecovery.length > 0) {
      activeTodayRecovery.forEach((item) => {
        entries.push({
          id: `recovery-${item.id}`,
          time: 'Active',
          title: `Recovery: ${item.label}`,
          sub: `Severity ${item.severity ?? 5}/10`,
          type: 'recovery',
          actionLabel: 'View',
          onAction: () =>
            router.push(
              `/(app)/recovery-event?id=${encodeURIComponent(item.sourceRecordId)}` as Href
            ),
        });
      });
    }

    if (measurementsData && measurementsData.latestByMetric.length > 0) {
      const topMeasurement = measurementsData.latestByMetric[0];
      entries.push({
        id: `measurement-${topMeasurement.id}`,
        time: 'Latest',
        title: `Measurement: ${topMeasurement.metricKey}`,
        sub: `${topMeasurement.value} ${topMeasurement.unit}`,
        type: 'measurement',
        actionLabel: 'View',
        onAction: () => setMeasurementsDetailSheetOpen(true),
      });
    }

    return entries;
  }, [isWellnessDone, todayWellness, todayNutrition, activeTodayRecovery, measurementsData]);

  return (
    <SafeAreaView
      testID="log-screen"
      edges={{ top: true }}
      style={{ flex: 1, backgroundColor: theme.surface }}
    >
      <View ref={containerRef} className="flex-1 bg-surface">
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-6 pt-4"
          contentContainerStyle={{ paddingBottom: tabBottomPad }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Top Header */}
          <View className="flex-row items-baseline justify-between mb-1">
            <Text className="text-2xl font-bold text-text-primary">Today's Log</Text>
            <Text className="text-sm font-semibold text-text-muted">{todayDateStr}</Text>
          </View>

          {/* Context-Aware Daily Status Banner */}
          <View className="mt-2 flex-row items-center justify-between rounded-xl border border-border bg-card p-3.5">
            <View className="flex-row items-center gap-2.5">
              <View
                className="h-2.5 w-2.5 rounded-full"
                style={{
                  backgroundColor: isWellnessDone ? Colors.brand : Colors.modify,
                }}
              />
              <Text className="text-xs font-semibold text-text-primary">
                {isWellnessDone ? 'Wellness completed' : 'Wellness pending'}
                {activeTodayRecovery.length > 0
                  ? ` • ${activeTodayRecovery.length} active recovery context`
                  : ''}
              </Text>
            </View>
            <Pressable
              hitSlop={8}
              onPress={() => {
                hapticLight();
                setWellnessSheetOpen(true);
              }}
            >
              <Text className="text-xs font-semibold text-brand">
                {isWellnessDone ? 'Update' : 'Check in'}
              </Text>
            </Pressable>
          </View>

          {/* Quick Action Buttons Grid */}
          <Text className="mt-5 mb-2.5 text-xs font-semibold uppercase tracking-widest text-text-muted">
            Quick Actions
          </Text>
          <View className="flex-row flex-wrap gap-2.5">
            {nutritionEnabled ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Log meal"
                className="flex-1 min-w-[45%] flex-row items-center gap-3 rounded-xl border border-border bg-card p-3.5 active:opacity-80"
                onPress={() => {
                  hapticLight();
                  setMealSheetOpen(true);
                }}
              >
                <View className="h-9 w-9 items-center justify-center rounded-full bg-border-strong">
                  <AppSymbol sf="fork.knife" size={16} tintColor={theme.textPrimary} fallback="🍽️" />
                </View>
                <View>
                  <Text className="text-sm font-bold text-text-primary">Log Meal</Text>
                  <Text className="text-[11px] text-text-muted">Food & macros</Text>
                </View>
              </Pressable>
            ) : null}

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Add water"
              className="flex-1 min-w-[45%] flex-row items-center gap-3 rounded-xl border border-border bg-card p-3.5 active:opacity-80"
              onPress={() => {
                hapticLight();
                setHydrationSheetOpen(true);
              }}
            >
              <View className="h-9 w-9 items-center justify-center rounded-full bg-border-strong">
                <AppSymbol sf="drop.fill" size={16} tintColor={theme.textPrimary} fallback="💧" />
              </View>
              <View>
                <Text className="text-sm font-bold text-text-primary">Add Water</Text>
                <Text className="text-[11px] text-text-muted">Hydration presets</Text>
              </View>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Log recovery event"
              className="flex-1 min-w-[45%] flex-row items-center gap-3 rounded-xl border border-border bg-card p-3.5 active:opacity-80"
              onPress={() => {
                hapticLight();
                router.push('/(app)/recovery-event' as Href);
              }}
            >
              <View className="h-9 w-9 items-center justify-center rounded-full bg-border-strong">
                <AppSymbol sf="cross.case.fill" size={16} tintColor={theme.textPrimary} fallback="🩹" />
              </View>
              <View>
                <Text className="text-sm font-bold text-text-primary">Recovery Event</Text>
                <Text className="text-[11px] text-text-muted">Illness, stress, injury</Text>
              </View>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Add measurement"
              className="flex-1 min-w-[45%] flex-row items-center gap-3 rounded-xl border border-border bg-card p-3.5 active:opacity-80"
              onPress={() => {
                hapticLight();
                setMeasurementSheetOpen(true);
              }}
            >
              <View className="h-9 w-9 items-center justify-center rounded-full bg-border-strong">
                <AppSymbol sf="ruler" size={16} tintColor={theme.textPrimary} fallback="📏" />
              </View>
              <View>
                <Text className="text-sm font-bold text-text-primary">Measurement</Text>
                <Text className="text-[11px] text-text-muted">Weight, HR, body comp</Text>
              </View>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="AI Coach Check-in"
              className="flex-1 min-w-[45%] flex-row items-center gap-3 rounded-xl border border-border bg-card p-3.5 active:opacity-80"
              onPress={() => {
                hapticLight();
                router.push('/(app)/daily-checkin' as Href);
              }}
            >
              <View className="h-9 w-9 items-center justify-center rounded-full bg-border-strong">
                <AppSymbol sf="bubble.left.and.bubble.right" size={16} tintColor={theme.brand} fallback="💬" />
              </View>
              <View>
                <Text className="text-sm font-bold text-text-primary">AI Coach Qs</Text>
                <Text className="text-[11px] text-text-muted">Tailored readiness</Text>
              </View>
            </Pressable>
          </View>

          {/* Today's Entries Timeline Feed */}
          <Text className="mt-6 mb-2.5 text-xs font-semibold uppercase tracking-widest text-text-muted">
            Today's Entries
          </Text>

          {todayEntries.length === 0 ? (
            <View className="rounded-xl border border-border bg-card p-4">
              <Text className="text-sm text-text-muted">
                No entries logged yet today. Tap a quick action above to start.
              </Text>
            </View>
          ) : (
            <View className="gap-2">
              {todayEntries.map((entry) => (
                <View
                  key={entry.id}
                  className="flex-row items-center justify-between rounded-xl border border-border bg-card p-3.5"
                >
                  <View className="flex-row items-center gap-3">
                    <View className="rounded bg-border px-2 py-1">
                      <Text className="text-[10px] font-bold text-text-muted">{entry.time}</Text>
                    </View>
                    <View>
                      <Text className="text-sm font-semibold text-text-primary">
                        {entry.title}
                      </Text>
                      <Text className="text-xs text-text-muted">{entry.sub}</Text>
                    </View>
                  </View>

                  <Pressable hitSlop={8} onPress={entry.onAction} className="py-1 active:opacity-70">
                    <Text className="text-xs font-semibold text-brand">{entry.actionLabel}</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          )}

          {/* Secondary Summary Cards */}
          <Text className="mt-8 mb-2.5 text-xs font-semibold uppercase tracking-widest text-text-muted">
            Nutrition & Metrics Summary
          </Text>

          {/* Nutrition Summary Card */}
          {nutritionEnabled && todayNutrition ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Nutrition & Hydration Summary"
              className="mb-3 rounded-xl border border-border bg-card p-4 active:opacity-80"
              onPress={() => {
                hapticLight();
                setNutritionDetailSheetOpen(true);
              }}
            >
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-sm font-semibold text-text-primary">Nutrition & Hydration</Text>
                <Text className="text-xs font-semibold text-brand">View Details ›</Text>
              </View>

              <View className="flex-row items-baseline gap-2">
                <Text className="text-xl font-extrabold text-text-primary">
                  {todayNutrition.calories}
                  <Text className="text-xs font-semibold text-text-muted">
                    {todayNutrition.caloriesGoal != null
                      ? ` / ${todayNutrition.caloriesGoal} kcal`
                      : ' kcal'}
                  </Text>
                </Text>
                {todayNutrition.caloriesGoal != null ? (
                  <Text className="text-xs font-semibold text-brand">
                    ({goalProgressPct(todayNutrition.calories, todayNutrition.caloriesGoal)}%)
                  </Text>
                ) : null}
              </View>

              <Text className="mt-1 text-xs text-text-muted">
                Carbs {formatMacroGrams(todayNutrition.carbs)}g · Protein{' '}
                {formatMacroGrams(todayNutrition.protein)}g · Fat{' '}
                {formatMacroGrams(todayNutrition.fat)}g
              </Text>
            </Pressable>
          ) : null}

          {/* Body Measurements Summary Card */}
          {measurementsData ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Body Measurements Summary"
              className="mb-3 rounded-xl border border-border bg-card p-4 active:opacity-80"
              onPress={() => {
                hapticLight();
                setMeasurementsDetailSheetOpen(true);
              }}
            >
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-sm font-semibold text-text-primary">Body Measurements</Text>
                <Text className="text-xs font-semibold text-brand">View Details ›</Text>
              </View>

              {measurementsData.latestByMetric.length > 0 ? (
                <View className="flex-row flex-wrap gap-3">
                  {measurementsData.latestByMetric.slice(0, 3).map((m) => (
                    <View key={m.id} className="rounded-lg bg-surface px-3 py-2">
                      <Text className="text-[10px] font-bold text-text-muted uppercase">
                        {m.metricKey}
                      </Text>
                      <Text className="text-sm font-bold text-text-primary">
                        {m.value} {m.unit}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text className="text-xs text-text-muted">No measurements recorded yet.</Text>
              )}
            </Pressable>
          ) : null}
        </ScrollView>

        {/* Modal Action Sheets */}
        <LogMealSheet
          visible={mealSheetOpen}
          onOpenPhotoFlow={() => {
            setMealSheetOpen(false);
            router.push('/(app)/(tabs)/log/photo-meal' as Href);
          }}
          onClose={() => {
            setMealSheetOpen(false);
            router.setParams({ action: undefined, t: undefined });
          }}
        />
        <HydrationQuickAddSheet
          visible={hydrationSheetOpen}
          onClose={() => setHydrationSheetOpen(false)}
          currentWaterMl={todayNutrition?.waterMl ?? 0}
          targetWaterMl={todayNutrition?.fluidGoalMl ?? null}
        />
        <WellnessCheckinSheet
          visible={wellnessSheetOpen}
          onClose={() => setWellnessSheetOpen(false)}
          initialValues={wellnessInitialValues}
          weightUnits={athleteProfile?.weightUnits}
          weightUnitLabel={weightUnitLabel}
        />
        <MeasurementSheet
          visible={measurementSheetOpen}
          onClose={() => setMeasurementSheetOpen(false)}
        />

        {/* Modal Detail Sheets */}
        <NutritionDetailSheet
          visible={nutritionDetailSheetOpen}
          onClose={() => setNutritionDetailSheetOpen(false)}
        />
        <MeasurementsDetailSheet
          visible={measurementsDetailSheetOpen}
          onClose={() => setMeasurementsDetailSheetOpen(false)}
        />
      </View>
    </SafeAreaView>
  );
}
