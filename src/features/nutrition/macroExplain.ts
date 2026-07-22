/**
 * Display-side breakdown for nutrition analysis sheets.
 * Mirrors coach-wattz MacroExplainModal.vue (plan-first; settings optional).
 *
 * GET /api/profile/nutrition is session-cookie oriented today and is not wired
 * here — calorie rows use fuelingPlan.dailyTotals; macro g/kg baselines that
 * need settings are omitted when settings are absent so we never invent values.
 */

import type {
  FuelingPlanAnalysis,
  FuelingPlanWindow,
  MacroExplainLabel,
  NutritionDayTotals,
} from './types';

export type MacroExplainRow = {
  label: string;
  description: string;
  value: string;
  badgeLabel?: string;
};

export type MacroExplainModel = {
  label: MacroExplainLabel;
  unit: string;
  actual: number;
  target: number;
  fuelState: number;
  rows: MacroExplainRow[];
  coachTip: string;
};

/** Optional nutrition-settings slice when a Bearer path becomes available. */
export type MacroExplainSettings = {
  bmr?: number;
  activityLevel?: string;
  baseCaloriesMode?: 'AUTO' | 'MANUAL_NON_EXERCISE';
  nonExerciseBaseCalories?: number;
  targetAdjustmentPercent?: number;
  goalProfile?: string;
  fuelingSensitivity?: number;
  baseProteinPerKg?: number;
  baseFatPerKg?: number;
};

const WORKOUT_WINDOW_TYPES = [
  'PRE_WORKOUT',
  'INTRA_WORKOUT',
  'POST_WORKOUT',
  'TRANSITION',
] as const;

function sumWindowMacro(
  windows: FuelingPlanWindow[],
  macroKey: 'targetCarbs' | 'targetProtein' | 'targetFat',
  types?: readonly string[]
): number {
  return windows
    .filter((win) => !types || types.includes(win.type))
    .reduce((sum, win) => sum + Math.max(0, Number(win[macroKey] || 0)), 0);
}

function metricActualTarget(
  day: NutritionDayTotals,
  label: MacroExplainLabel
): { actual: number; target: number; unit: string } {
  switch (label) {
    case 'Calories':
      return {
        actual: Math.max(0, day.calories),
        target: Math.max(0, day.caloriesGoal ?? 0),
        unit: 'kcal',
      };
    case 'Carbs':
      return {
        actual: Math.max(0, day.carbs),
        target: Math.max(0, day.carbsGoal ?? 0),
        unit: 'g',
      };
    case 'Protein':
      return {
        actual: Math.max(0, day.protein),
        target: Math.max(0, day.proteinGoal ?? 0),
        unit: 'g',
      };
    case 'Fat':
      return {
        actual: Math.max(0, day.fat),
        target: Math.max(0, day.fatGoal ?? 0),
        unit: 'g',
      };
  }
}

function buildCaloriesRows(
  plan: FuelingPlanAnalysis | null,
  target: number,
  settings?: MacroExplainSettings | null
): MacroExplainRow[] {
  const items: MacroExplainRow[] = [];
  const fp = plan?.dailyTotals;
  const s = settings || {};

  const bmrBase = Math.round(s.bmr || 1600);
  const baseCaloriesMode =
    fp?.baseCaloriesMode ||
    (s.baseCaloriesMode === 'MANUAL_NON_EXERCISE' ? 'MANUAL_NON_EXERCISE' : 'AUTO');

  const activityMultipliers: Record<string, number> = {
    SEDENTARY: 1.2,
    LIGHTLY_ACTIVE: 1.375,
    ACTIVE: 1.55,
    MODERATELY_ACTIVE: 1.725,
    VERY_ACTIVE: 1.9,
    EXTRA_ACTIVE: 2.1,
  };
  const fallbackBaseCalories =
    baseCaloriesMode === 'MANUAL_NON_EXERCISE'
      ? Number(s.nonExerciseBaseCalories || 0)
      : bmrBase * (activityMultipliers[s.activityLevel || 'ACTIVE'] || 1.55);
  const baseCalories = Math.round(fp?.baseCalories ?? fallbackBaseCalories);

  if (baseCalories > 0 || fp?.baseCalories != null || settings) {
    if (baseCaloriesMode === 'MANUAL_NON_EXERCISE') {
      items.push({
        label: 'Manual Non-Exercise Baseline',
        description: 'Your explicit daily calorie baseline for days without structured training.',
        value: `${baseCalories} kcal`,
      });
    } else if (fp?.baseCalories != null || settings) {
      items.push({
        label: 'Base Calories (Auto)',
        description: 'Computed from BMR and your selected activity level.',
        value: `${baseCalories} kcal`,
      });
      if (settings?.bmr != null) {
        items.push({
          label: 'Basal Metabolic Rate (BMR)',
          description: 'Energy required for basic life functions at rest.',
          value: `${bmrBase} kcal`,
        });
      }
    }
  }

  const workouts = fp?.workoutCalories ?? [];
  if (workouts.length > 0) {
    for (const w of workouts) {
      const sourceType = w.sourceType === 'actual' ? 'actual' : 'estimated';
      items.push({
        label: w.title || 'Training Demand',
        description:
          sourceType === 'actual'
            ? 'Actual recorded energy cost of this completed workout.'
            : 'Estimated energy cost of this workout.',
        value: `+${Math.round(w.calories)} kcal`,
        badgeLabel: sourceType === 'actual' ? 'ACTUAL' : 'EST',
      });
    }
  } else if ((fp?.activityCalories ?? 0) > 5) {
    items.push({
      label: 'Training Demand',
      description: "Estimated energy cost of today's planned workouts.",
      value: `+${Math.round(fp!.activityCalories!)} kcal`,
      badgeLabel: 'EST',
    });
  }

  let adjustmentValue = fp?.adjustmentCalories ?? undefined;
  if (adjustmentValue === undefined || adjustmentValue === null) {
    if (s.targetAdjustmentPercent) {
      const subtotal = baseCalories + (fp?.activityCalories || 0);
      adjustmentValue = Math.round(subtotal * (s.targetAdjustmentPercent / 100));
    } else if (target > 0 && baseCalories > 0) {
      adjustmentValue = target - baseCalories - (fp?.activityCalories || 0);
    } else {
      adjustmentValue = 0;
    }
  }

  if (Math.abs(adjustmentValue) > 5) {
    items.push({
      label: s.goalProfile ? `Goal Adjustment (${s.goalProfile})` : 'Goal Adjustment',
      description: 'Adjustment applied for your goal.',
      value: `${adjustmentValue > 0 ? '+' : ''}${Math.round(adjustmentValue)} kcal`,
    });
  }

  return items;
}

function buildMacroRows(
  label: 'Carbs' | 'Protein' | 'Fat',
  plan: FuelingPlanAnalysis | null,
  target: number,
  actual: number,
  fuelState: number,
  weightKg: number | null,
  settings?: MacroExplainSettings | null
): MacroExplainRow[] {
  const items: MacroExplainRow[] = [];
  const windows = plan?.windows ?? [];
  const safeWeight = Math.max(1, weightKg || 75);
  const hasWeight = weightKg != null && weightKg > 0;
  const s = settings || {};
  const adjustmentMultiplier = 1 + (s.targetAdjustmentPercent || 0) / 100;

  const macroKey =
    label === 'Carbs' ? 'targetCarbs' : label === 'Protein' ? 'targetProtein' : 'targetFat';

  if (label === 'Carbs' && settings) {
    const sensitivity = s.fuelingSensitivity || 1.0;
    const base = target / (safeWeight * sensitivity * adjustmentMultiplier);
    items.push({
      label: 'Metabolic Baseline',
      description: `Based on your Fuel State ${fuelState || 1} activity intensity.`,
      value: `${base.toFixed(1)} g/kg`,
    });
    items.push({
      label: 'Sensitivity Factor',
      description: 'Global multiplier applied to your carb ranges.',
      value: `x${sensitivity}`,
    });
    if (s.targetAdjustmentPercent) {
      items.push({
        label: 'Goal Adjustment',
        description: `Scaled for your current profile goal (${s.goalProfile || 'GOAL'}).`,
        value: `${s.targetAdjustmentPercent > 0 ? '+' : ''}${s.targetAdjustmentPercent}%`,
      });
    }
  } else if (label === 'Protein' && (settings?.baseProteinPerKg != null || hasWeight)) {
    if (settings?.baseProteinPerKg != null) {
      items.push({
        label: 'Muscle Maintenance',
        description: 'Standard recommendation for endurance athletes to support repair.',
        value: `${settings.baseProteinPerKg} g/kg`,
      });
    }
    if (hasWeight) {
      items.push({
        label: 'Athlete Weight',
        description: 'Your current weight used for scale-based calculation.',
        value: `${weightKg!.toFixed(1)} kg`,
      });
    }
  } else if (label === 'Fat' && (settings?.baseFatPerKg != null || hasWeight)) {
    if (settings?.baseFatPerKg != null) {
      items.push({
        label: 'Hormonal Baseline',
        description: 'Essential fats for hormonal health and vitamin absorption.',
        value: `${settings.baseFatPerKg} g/kg`,
      });
    }
    if (hasWeight) {
      items.push({
        label: 'Athlete Weight',
        description: 'Your current weight used for scale-based calculation.',
        value: `${weightKg!.toFixed(1)} kg`,
      });
    }
  }

  const workoutAllocation = sumWindowMacro(windows, macroKey, WORKOUT_WINDOW_TYPES);
  const baseAllocation = sumWindowMacro(windows, macroKey, ['DAILY_BASE']);
  const fallbackBaseAllocation = Math.max(0, target - workoutAllocation);
  const totalAllocation = sumWindowMacro(windows, macroKey);

  if (totalAllocation > 0) {
    if (label === 'Protein') {
      items.push({
        label: 'Workout Recovery Allocation',
        description: 'Protein specifically distributed around training windows.',
        value: `${Math.round(workoutAllocation)} g`,
      });
    } else {
      items.push({
        label: 'Workout Window Allocation',
        description:
          label === 'Carbs'
            ? 'Carbs assigned to pre/intra/post workout windows.'
            : 'Fat assigned to training-adjacent meals.',
        value: `${Math.round(workoutAllocation)} g`,
      });
    }
    if (baseAllocation > 0) {
      items.push({
        label: label === 'Carbs' ? 'Daily Base Allocation' : 'Baseline Meal Allocation',
        description:
          label === 'Carbs'
            ? 'Carbs reserved for non-workout baseline meals.'
            : `${label} distributed across regular meal windows.`,
        value: `${Math.round(baseAllocation)} g`,
      });
    } else if (fallbackBaseAllocation > 0) {
      items.push({
        label: 'Unassigned Daily Balance',
        description: `No explicit baseline meal slots were saved for this day. This remaining ${label.toLowerCase()} budget can be distributed across regular meals.`,
        value: `${Math.round(fallbackBaseAllocation)} g`,
      });
    }
  }

  if (target > 0 && hasWeight) {
    items.push({
      label: 'Final Target Intensity',
      description: 'Resulting grams per kilogram at your current target.',
      value: `${(target / safeWeight).toFixed(2)} g/kg`,
    });
  }

  if (target > 0) {
    const kcalPerG = label === 'Fat' ? 9 : 4;
    items.push({
      label: 'Energy Contribution',
      description: `Calories provided by this ${label.toLowerCase()} target.`,
      value: `${Math.round(target * kcalPerG)} kcal`,
    });
    items.push({
      label: 'Progress Today',
      description: 'Logged intake compared with your daily target.',
      value:
        actual >= target
          ? `${Math.round(actual - target)}g above target`
          : `${Math.round(target - actual)}g remaining`,
    });
  }

  return items;
}

export function buildCoachTip(
  label: MacroExplainLabel,
  actual: number,
  target: number,
  fuelState: number
): string {
  if (label === 'Carbs') {
    if (actual >= target && target > 0) {
      return 'Daily carb target reached. Extra carbs are optional and should be used only if a timing-specific window still needs support.';
    }
    return fuelState === 3
      ? 'Today is a high-output day. Prioritize carbs around key windows first, then close any remaining daily gap.'
      : 'Lower intensity day: keep carbs steady and focus on timing around training demands rather than overfeeding late.';
  }
  if (label === 'Protein') {
    return actual >= target && target > 0
      ? 'Protein target is already covered. Keep the rest of the day lighter and prioritize hydration and sleep.'
      : 'Spread protein across 4-5 servings and prioritize one feeding in the recovery window for best muscle repair.';
  }
  if (label === 'Fat') {
    return actual >= target && target > 0
      ? 'Fat intake is already high for today. Keep upcoming meals lower-fat to improve digestion and preserve carb timing flexibility.'
      : 'Use quality fats (olive oil, nuts, avocado) and keep heavy fat away from pre/intra/post workout windows.';
  }
  return 'These targets are dynamic. They adjust automatically whenever your training plan or intensity changes.';
}

export function buildMacroExplainModel(input: {
  label: MacroExplainLabel;
  day: NutritionDayTotals;
  weightKg?: number | null;
  settings?: MacroExplainSettings | null;
}): MacroExplainModel {
  const { label, day, weightKg = null, settings = null } = input;
  const { actual, target, unit } = metricActualTarget(day, label);
  const fuelState = day.fuelState ?? day.fuelingPlan?.dailyTotals.fuelState ?? 1;

  const rows =
    label === 'Calories'
      ? buildCaloriesRows(day.fuelingPlan, target, settings)
      : buildMacroRows(label, day.fuelingPlan, target, actual, fuelState, weightKg, settings);

  return {
    label,
    unit,
    actual,
    target,
    fuelState,
    rows,
    coachTip: buildCoachTip(label, actual, target, fuelState),
  };
}
