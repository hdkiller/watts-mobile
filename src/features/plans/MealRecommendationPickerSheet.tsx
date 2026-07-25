/* Hallmark · genre: modern-minimal · design-system: docs/DESIGN.md · designed-as-app */
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { ApiError, friendlyError } from '@/src/api/errors';
import { BottomSheet } from '@/src/components/BottomSheet';
import { Button } from '@/src/components/Button';
import {
  useLockNutritionPlanMeal,
  useMealRecommendations,
  usePatchNutritionPlanMeal,
} from '@/src/features/nutrition/useNutrition';
import { hapticError, hapticLight, hapticSuccess } from '@/src/lib/haptics';
import { Colors } from '@/src/theme/colors';

import type { MealRecommendationOption, NutritionPlanWindowView } from './types';

const SLOW_HINT_MS = 8000;

type Props = {
  visible: boolean;
  dateKey: string;
  window: NutritionPlanWindowView | null;
  onClose: () => void;
};

function isQuotaError(err: unknown): boolean {
  if (err instanceof ApiError && err.status === 429) return true;
  if (err instanceof Error && err.message.toLowerCase().includes('quota')) return true;
  return false;
}

function optionMacros(option: MealRecommendationOption): string {
  const t = option.totals ?? {};
  const parts: string[] = [];
  if (t.kcal != null) parts.push(`${Math.round(Number(t.kcal))} kcal`);
  if (t.carbs != null) parts.push(`${Math.round(Number(t.carbs))}g C`);
  if (t.protein != null) parts.push(`${Math.round(Number(t.protein))}g P`);
  if (t.fat != null) parts.push(`${Math.round(Number(t.fat))}g F`);
  return parts.join(' · ');
}

function PickerBody({
  dateKey,
  window,
  onClose,
}: {
  dateKey: string;
  window: NutritionPlanWindowView;
  onClose: () => void;
}) {
  const recommend = useMealRecommendations();
  const lockMeal = useLockNutritionPlanMeal();
  const patchMeal = usePatchNutritionPlanMeal();

  const [options, setOptions] = useState<MealRecommendationOption[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [slowHint, setSlowHint] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const slowTimer = setTimeout(() => {
      if (!cancelled) setSlowHint(true);
    }, SLOW_HINT_MS);

    void recommend
      .mutateAsync({
        date: dateKey,
        windowType: window.windowType,
        targetCarbs: window.targetCarbs || undefined,
        targetProtein: window.targetProtein || undefined,
        targetKcal: window.targetKcal || undefined,
      })
      .then((rows) => {
        if (cancelled) return;
        setOptions(rows);
        setSlowHint(false);
      })
      .catch((err) => {
        if (cancelled) return;
        hapticError();
        if (isQuotaError(err)) {
          setError('Meal recommendation limit reached — try again later');
        } else {
          setError(friendlyError(err, 'Could not load meal options'));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
        clearTimeout(slowTimer);
      });

    return () => {
      cancelled = true;
      clearTimeout(slowTimer);
    };
    // Mounted per window key — fetch once on open.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const busy = loading || confirming;

  const onConfirm = async () => {
    if (selectedIndex == null || !options[selectedIndex]) return;
    const meal = options[selectedIndex];
    setConfirming(true);
    setError(null);
    try {
      if (window.meal?.id) {
        await patchMeal.mutateAsync({
          mealId: window.meal.id,
          action: 'replace',
          meal,
        });
      } else {
        await lockMeal.mutateAsync({
          date: dateKey,
          windowType: window.windowType,
          slotName: window.slotName ?? undefined,
          meal,
        });
      }
      hapticSuccess();
      onClose();
    } catch (err) {
      hapticError();
      setError(friendlyError(err, 'Could not lock this meal'));
    } finally {
      setConfirming(false);
    }
  };

  return (
    <>
      <Text className="mb-1 text-lg font-semibold text-text-primary">Choose a meal</Text>
      <Text className="mb-3 text-sm text-text-muted">
        {window.label}
        {window.targetKcal ? ` · ~${window.targetKcal} kcal` : ''}
      </Text>

      {loading ? (
        <View className="items-center gap-2 py-8" testID="plan-nutrition-meal-picker-pending">
          <ActivityIndicator color={Colors.brand} />
          <Text className="text-sm text-text-muted">Finding meal options…</Text>
          {slowHint ? (
            <Text className="px-2 text-center text-xs text-text-muted">
              Still working — meal recommendations can take a minute.
            </Text>
          ) : null}
        </View>
      ) : null}

      {error ? (
        <View className="mb-3 rounded-xl border border-danger/40 bg-tint-error p-3">
          <Text className="text-sm text-danger" testID="plan-nutrition-meal-picker-error">
            {error}
          </Text>
        </View>
      ) : null}

      {!loading && !error && options.length === 0 ? (
        <Text className="py-4 text-sm text-text-muted">No meal options for this window.</Text>
      ) : null}

      <View className="gap-2">
        {options.map((option, index) => {
          const selected = selectedIndex === index;
          const macros = optionMacros(option);
          return (
            <Pressable
              key={`${option.title}-${index}`}
              testID={`plan-nutrition-meal-option-${index}`}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              className={`rounded-xl border px-3 py-3 ${
                selected ? 'border-brand bg-brand/10' : 'border-border bg-card'
              }`}
              onPress={() => {
                hapticLight();
                setSelectedIndex(index);
              }}
            >
              <Text className="text-sm font-semibold text-text-primary">{option.title}</Text>
              {macros ? (
                <Text className="mt-1 text-xs text-text-muted">{macros}</Text>
              ) : null}
            </Pressable>
          );
        })}
      </View>

      <Button
        className="mt-4"
        label={window.meal ? 'Replace meal' : 'Lock meal'}
        testID="plan-nutrition-meal-lock"
        loading={confirming}
        disabled={busy || selectedIndex == null}
        onPress={() => void onConfirm()}
      />
      <View className="mt-2">
        <Button label="Cancel" variant="secondary" disabled={confirming} onPress={onClose} />
      </View>
    </>
  );
}

export function MealRecommendationPickerSheet({ visible, dateKey, window, onClose }: Props) {
  return (
    <BottomSheet
      visible={visible && window != null}
      onClose={onClose}
      testID="plan-nutrition-meal-picker"
    >
      {window ? (
        <PickerBody
          key={`${dateKey}:${window.key}`}
          dateKey={dateKey}
          window={window}
          onClose={onClose}
        />
      ) : null}
    </BottomSheet>
  );
}
