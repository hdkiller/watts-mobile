/* Hallmark · genre: modern-minimal · design-system: docs/DESIGN.md · designed-as-app */
import { Modal, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppSymbol } from '@/src/components/AppSymbol';
import { Button } from '@/src/components/Button';
import { NutritionAccentClasses, NutritionAccents } from '@/src/theme/nutritionAccents';

import { buildMacroExplainModel } from './macroExplain';
import { goalProgressPct } from './mapNutrition';
import type { MacroExplainLabel, NutritionDayTotals } from './types';
import { useNutritionSettingsQuery } from './useNutritionSettings';

const ACCENT: Record<
  MacroExplainLabel,
  { color: string; barClass: string; sf: 'flame.fill' | 'leaf' | 'heart.fill' | 'drop.fill' }
> = {
  Calories: {
    color: NutritionAccents.calories,
    barClass: NutritionAccentClasses.calories.bg,
    sf: 'flame.fill',
  },
  Carbs: {
    color: NutritionAccents.carbs,
    barClass: NutritionAccentClasses.carbs.bg,
    sf: 'leaf',
  },
  Protein: {
    color: NutritionAccents.protein,
    barClass: NutritionAccentClasses.protein.bg,
    sf: 'heart.fill',
  },
  Fat: {
    color: NutritionAccents.fat,
    barClass: NutritionAccentClasses.fat.bg,
    sf: 'drop.fill',
  },
};

export function NutritionMacroExplainSheet({
  visible,
  label,
  day,
  weightKg,
  onClose,
}: {
  visible: boolean;
  label: MacroExplainLabel | null;
  day: NutritionDayTotals | null;
  weightKg?: number | null;
  onClose: () => void;
}) {
  const { data: settings } = useNutritionSettingsQuery({ enabled: visible && !!label && !!day });

  if (!label || !day) return null;

  const model = buildMacroExplainModel({
    label,
    day,
    weightKg: weightKg ?? settings?.weightKg ?? null,
    settings: settings
      ? {
          bmr: settings.bmr,
          activityLevel: settings.activityLevel,
          baseCaloriesMode: settings.baseCaloriesMode,
          nonExerciseBaseCalories: settings.nonExerciseBaseCalories ?? undefined,
          targetAdjustmentPercent: settings.targetAdjustmentPercent,
          goalProfile: settings.goalProfile,
          fuelingSensitivity: settings.fuelingSensitivity,
          baseProteinPerKg: settings.baseProteinPerKg,
          baseFatPerKg: settings.baseFatPerKg,
        }
      : null,
  });
  const accent = ACCENT[label];
  const progress = goalProgressPct(model.actual, model.target > 0 ? model.target : null);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1 bg-surface" edges={['top', 'bottom']}>
        <ScrollView className="flex-1" contentContainerClassName="px-6 pb-8 pt-5">
          <View className="flex-row items-center justify-between">
            <View className="min-w-0 flex-1 flex-row items-center gap-2 pr-3">
              <AppSymbol sf={accent.sf} size={22} tintColor={accent.color} fallback="·" />
              <Text className="text-lg font-semibold text-text-primary">{label} analysis</Text>
            </View>
            <Text className="text-2xl font-semibold" style={{ color: accent.color }}>
              {Math.round(model.actual)}
              {model.unit}
            </Text>
          </View>

          <View className="mt-5 rounded-xl border border-border bg-card px-4 py-3.5">
            <View className="flex-row items-center justify-between">
              <Text className="text-xs font-semibold uppercase tracking-widest text-text-muted">
                Total daily target
              </Text>
              <Text className="text-sm font-semibold text-text-primary">
                {Math.round(model.target)}
                {model.unit}
              </Text>
            </View>
            <View className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-border">
              <View
                className={`h-1.5 rounded-full ${accent.barClass}`}
                style={{ width: `${progress ?? 0}%` }}
              />
            </View>
          </View>

          <View className="mt-6">
            <Text className="mb-2 text-xs font-semibold uppercase tracking-widest text-text-muted">
              Calculation logic
            </Text>

            {model.rows.length === 0 ? (
              <Text className="py-3 text-sm text-text-muted">
                Target details are not available for this day yet.
              </Text>
            ) : (
              model.rows.map((row) => (
                <View
                  key={`${row.label}-${row.value}`}
                  className="flex-row items-start justify-between border-b border-border py-3 last:border-b-0"
                >
                  <View className="min-w-0 flex-1 pr-3">
                    <View className="flex-row flex-wrap items-center gap-1.5">
                      <Text className="text-sm font-medium text-text-primary">{row.label}</Text>
                      {row.badgeLabel ? (
                        <View className="rounded bg-border px-1.5 py-0.5">
                          <Text className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">
                            {row.badgeLabel}
                          </Text>
                        </View>
                      ) : null}
                    </View>
                    <Text className="mt-0.5 text-xs leading-snug text-text-muted">
                      {row.description}
                    </Text>
                  </View>
                  <Text className="text-sm font-semibold text-text-primary">{row.value}</Text>
                </View>
              ))
            )}
          </View>

          <View className="mt-5 rounded-xl border border-border bg-card px-4 py-3.5">
            <Text className="text-sm font-semibold text-text-primary">Coach insight</Text>
            <Text className="mt-1.5 text-sm leading-6 text-text-body">{model.coachTip}</Text>
          </View>

          <Button className="mt-6" label="Close" variant="secondary" onPress={onClose} />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}
