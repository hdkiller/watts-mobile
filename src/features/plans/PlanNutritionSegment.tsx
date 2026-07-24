/* Hallmark · genre: modern-minimal · design-system: docs/DESIGN.md · designed-as-app
 * pre-emit critique: P4 H4 E4 S4 R5 V4 — empty week = one CTA, not seven hollow cards
 */
import { router, type Href } from 'expo-router';
import { useMemo, useState, type ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';

import { friendlyError } from '@/src/api/errors';
import { AnimatedPressable } from '@/src/components/AnimatedPressable';
import { Button } from '@/src/components/Button';
import { Skeleton } from '@/src/components/Skeleton';
import {
  useGenerateNutritionPlanDraft,
  useNutritionPlanQuery,
  usePatchNutritionPlanMeal,
  useRegenerateDayFuelingPlan,
} from '@/src/features/nutrition/useNutrition';
import { isNutritionTrackingEnabled } from '@/src/features/profile/mapProfile';
import { useAthleteProfileQuery } from '@/src/features/profile/useProfile';
import { hapticError, hapticLight, hapticSuccess } from '@/src/lib/haptics';
import { APP_HREFS } from '@/src/linking/appHrefs';

import { formatWeekRangeLabel, humanizeMealStatus, humanizeWindowType } from './formatPlanCopy';
import {
  mapNutritionPlanDays,
  weekHasSelectedMeals,
  weekRangeFromOffset,
} from './mapNutritionPlan';
import type { NutritionPlanApi, NutritionPlanMealView } from './types';

export function PlanNutritionSegment() {
  const profile = useAthleteProfileQuery();
  const trackingOn = isNutritionTrackingEnabled(profile.data);
  const [weekOffset, setWeekOffset] = useState(0);
  const range = useMemo(() => weekRangeFromOffset(weekOffset), [weekOffset]);
  const planQuery = useNutritionPlanQuery(range.start, range.end, { enabled: trackingOn });
  const generate = useGenerateNutritionPlanDraft();
  const regenDay = useRegenerateDayFuelingPlan();
  const patchMeal = usePatchNutritionPlanMeal();
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const plan = planQuery.data as NutritionPlanApi | null | undefined;
  const days = useMemo(() => mapNutritionPlanDays(plan ?? null, range), [plan, range]);
  const hasMeals = weekHasSelectedMeals(days);
  const selectedDay = useMemo(
    () => (selectedDateKey ? (days.find((d) => d.dateKey === selectedDateKey) ?? null) : null),
    [days, selectedDateKey]
  );
  const weekLabel = formatWeekRangeLabel(range.start, range.end) ?? `${range.start} – ${range.end}`;

  if (profile.isLoading) {
    return <PlanNutritionSkeleton />;
  }

  if (!trackingOn) {
    return (
      <View testID="plan-nutrition-tracking-off" className="gap-4 px-6 pt-6">
        <Text className="text-2xl font-semibold text-text-primary">Nutrition tracking is off</Text>
        <Text className="text-sm text-text-muted">
          Turn on tracking in Settings → Nutrition to plan meals and grocery lists here.
        </Text>
        <Button
          label="Open Nutrition settings"
          onPress={() => router.push(APP_HREFS.settingsNutrition as Href)}
        />
      </View>
    );
  }

  const run = async (label: string, fn: () => Promise<unknown>) => {
    setError(null);
    setBusy(label);
    try {
      await fn();
      hapticSuccess();
    } catch (err) {
      hapticError();
      setError(friendlyError(err, 'Something went wrong'));
    } finally {
      setBusy(null);
    }
  };

  const openGrocery = () => {
    hapticLight();
    router.push(`${APP_HREFS.planGrocery}?start=${range.start}&end=${range.end}` as Href);
  };

  const generateDraft = () =>
    void run('Generating meal plan', () =>
      generate.mutateAsync({ startDate: range.start, endDate: range.end })
    );

  return (
    <View testID="plan-nutrition" className="gap-4 px-6 pb-10 pt-4">
      {busy ? (
        <Text className="text-sm text-brand" testID="plan-nutrition-busy">
          {busy}…
        </Text>
      ) : null}
      {error ? (
        <View className="rounded-xl border border-danger/40 bg-tint-error p-3">
          <Text className="text-sm text-danger">{error}</Text>
        </View>
      ) : null}

      <View className="flex-row items-center justify-between">
        <AnimatedPressable
          hitSlop={8}
          disabled={Boolean(busy)}
          onPress={() => {
            hapticLight();
            setWeekOffset((o) => o - 1);
          }}
          accessibilityRole="button"
          accessibilityLabel="Previous week"
        >
          <Text className="text-sm font-semibold text-brand">Previous</Text>
        </AnimatedPressable>
        <Text className="text-sm font-semibold text-text-primary">{weekLabel}</Text>
        <AnimatedPressable
          hitSlop={8}
          disabled={Boolean(busy)}
          onPress={() => {
            hapticLight();
            setWeekOffset((o) => o + 1);
          }}
          accessibilityRole="button"
          accessibilityLabel="Next week"
        >
          <Text className="text-sm font-semibold text-brand">Next</Text>
        </AnimatedPressable>
      </View>

      {planQuery.isLoading && !hasMeals && !plan ? (
        <PlanNutritionSkeleton compact />
      ) : !hasMeals ? (
        <View className="gap-3" testID="plan-nutrition-empty">
          <Text className="text-sm text-text-muted">
            No meals selected this week yet. Generate a draft to fill fueling windows from your
            catalog.
          </Text>
          <Button
            label="Generate draft"
            onPress={generateDraft}
            loading={Boolean(busy)}
            disabled={Boolean(busy)}
            testID="plan-nutrition-generate"
          />
          <Button label="Grocery list" variant="secondary" onPress={openGrocery} disabled={Boolean(busy)} />
        </View>
      ) : (
        <>
          <View className="gap-2">
            <Button
              label="Regenerate draft"
              variant="secondary"
              disabled={Boolean(busy)}
              onPress={generateDraft}
            />
            <Button
              label="Grocery list"
              variant="secondary"
              disabled={Boolean(busy)}
              onPress={openGrocery}
            />
          </View>
          <View>
            {days.map((day) => (
              <AnimatedPressable
                key={day.dateKey}
                onPress={() => {
                  hapticLight();
                  setSelectedDateKey(day.dateKey);
                }}
                hitSlop={8}
                className="border-b border-border/80 py-3"
                accessibilityRole="button"
                accessibilityLabel={day.weekdayLabel}
              >
                <Text className="text-base font-medium text-text-primary">{day.weekdayLabel}</Text>
                <Text className="mt-1 text-sm text-text-muted">
                  {day.meals.length === 0
                    ? 'No meals selected'
                    : `${day.meals.length} meals · ${day.doneCount} done · ${day.skippedCount} skipped`}
                </Text>
              </AnimatedPressable>
            ))}
          </View>
        </>
      )}

      <SheetModal visible={Boolean(selectedDateKey)} onClose={() => setSelectedDateKey(null)}>
        <Text className="mb-3 text-lg font-semibold text-text-primary">
          {selectedDay?.weekdayLabel}
        </Text>
        <Button
          label="Regenerate day fueling"
          variant="secondary"
          disabled={Boolean(busy)}
          onPress={() => {
            if (!selectedDateKey) return;
            void run('Regenerating day', () => regenDay.mutateAsync(selectedDateKey));
          }}
        />
        <View className="mt-3 gap-2">
          {(selectedDay?.meals ?? []).length === 0 ? (
            <Text className="text-sm text-text-muted">No meals selected for this day.</Text>
          ) : (
            (selectedDay?.meals ?? []).map((meal) => (
              <MealRow
                key={meal.id}
                meal={meal}
                busy={Boolean(busy)}
                onAction={(action) =>
                  void run('Updating meal', () =>
                    patchMeal.mutateAsync({ mealId: meal.id, action })
                  )
                }
              />
            ))
          )}
        </View>
        <View className="mt-4">
          <Button label="Close" variant="secondary" onPress={() => setSelectedDateKey(null)} />
        </View>
      </SheetModal>
    </View>
  );
}

function SheetModal({
  visible,
  onClose,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        className="flex-1 justify-end bg-black/50"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable className="flex-1" onPress={onClose} accessibilityRole="button" />
        <View className="max-h-[85%] rounded-t-2xl bg-surface px-6 pb-10 pt-5">
          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            {children}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function PlanNutritionSkeleton({ compact = false }: { compact?: boolean } = {}) {
  return (
    <View className={compact ? 'gap-2' : 'gap-3 px-6 pt-6'} testID="plan-nutrition-skeleton">
      {!compact ? (
        <>
          <Skeleton className="h-4 w-1/2 self-center" />
          <Skeleton className="h-11 w-full rounded-xl" />
          <Skeleton className="h-11 w-full rounded-xl" />
        </>
      ) : null}
      <Skeleton className="h-12 rounded-xl" />
      <Skeleton className="h-12 rounded-xl" />
      <Skeleton className="h-12 rounded-xl" />
    </View>
  );
}

function MealRow({
  meal,
  busy,
  onAction,
}: {
  meal: NutritionPlanMealView;
  busy: boolean;
  onAction: (action: 'complete' | 'skip' | 'unlock') => void;
}) {
  const meta = [
    humanizeWindowType(meal.windowType),
    meal.scheduledLabel,
    humanizeMealStatus(meal.status),
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <View className="border-b border-border/80 py-3">
      <Text className="text-sm font-medium text-text-primary">{meal.title}</Text>
      {meta ? <Text className="mt-0.5 text-xs text-text-muted">{meta}</Text> : null}
      <View className="mt-2 flex-row gap-4">
        <AnimatedPressable hitSlop={8} disabled={busy} onPress={() => onAction('complete')}>
          <Text className="text-sm font-semibold text-brand">Done</Text>
        </AnimatedPressable>
        <AnimatedPressable hitSlop={8} disabled={busy} onPress={() => onAction('skip')}>
          <Text className="text-sm font-semibold text-text-muted">Skip</Text>
        </AnimatedPressable>
        <AnimatedPressable hitSlop={8} disabled={busy} onPress={() => onAction('unlock')}>
          <Text className="text-sm font-semibold text-text-muted">Unlock</Text>
        </AnimatedPressable>
      </View>
    </View>
  );
}
