import { describe, expect, it } from 'vitest';

import { buildCoachTip, buildMacroExplainModel } from '../macroExplain';
import { emptyNutritionDay } from '../mapNutrition';
import type { NutritionDayTotals } from '../types';

function dayWithPlan(overrides: Partial<NutritionDayTotals> = {}): NutritionDayTotals {
  return {
    ...emptyNutritionDay('2026-07-22'),
    calories: 0,
    caloriesGoal: 3392,
    carbs: 40,
    carbsGoal: 400,
    protein: 80,
    proteinGoal: 160,
    fat: 20,
    fatGoal: 90,
    hasGoals: true,
    fuelState: 2,
    fuelingPlan: {
      dailyTotals: {
        calories: 3392,
        carbs: 400,
        protein: 160,
        fat: 90,
        fluid: 3000,
        baseCalories: 2300,
        baseCaloriesMode: 'MANUAL_NON_EXERCISE',
        activityCalories: 696,
        adjustmentCalories: -599,
        fuelState: 2,
        workoutCalories: [
          { title: 'Full-Body Strength Session', calories: 412, sourceType: 'estimated' },
          { title: 'Treadmill Warmup Run', calories: 284, sourceType: 'estimated' },
        ],
      },
      windows: [
        { type: 'PRE_WORKOUT', targetCarbs: 40, targetProtein: 10, targetFat: 5 },
        { type: 'DAILY_BASE', targetCarbs: 200, targetProtein: 80, targetFat: 50 },
        { type: 'POST_WORKOUT', targetCarbs: 60, targetProtein: 30, targetFat: 5 },
      ],
    },
    ...overrides,
  };
}

describe('buildMacroExplainModel — calories', () => {
  it('builds baseline, workout EST rows, and goal adjustment from the plan', () => {
    const model = buildMacroExplainModel({ label: 'Calories', day: dayWithPlan() });

    expect(model.actual).toBe(0);
    expect(model.target).toBe(3392);
    expect(model.unit).toBe('kcal');
    expect(model.rows.map((r) => r.label)).toEqual([
      'Manual Non-Exercise Baseline',
      'Full-Body Strength Session',
      'Treadmill Warmup Run',
      'Goal Adjustment',
    ]);
    expect(model.rows[0]?.value).toBe('2300 kcal');
    expect(model.rows[1]?.badgeLabel).toBe('EST');
    expect(model.rows[1]?.value).toBe('+412 kcal');
    expect(model.rows[3]?.value).toBe('-599 kcal');
    expect(model.coachTip).toContain('dynamic');
  });

  it('shows ACTUAL badge for recorded workout energy', () => {
    const model = buildMacroExplainModel({
      label: 'Calories',
      day: dayWithPlan({
        fuelingPlan: {
          dailyTotals: {
            calories: 2800,
            carbs: null,
            protein: null,
            fat: null,
            fluid: null,
            baseCalories: 2200,
            baseCaloriesMode: 'MANUAL_NON_EXERCISE',
            activityCalories: 400,
            adjustmentCalories: null,
            fuelState: 1,
            workoutCalories: [
              { title: 'Morning Ride', calories: 400, sourceType: 'actual' },
            ],
          },
          windows: [],
        },
      }),
    });

    expect(model.rows.find((r) => r.label === 'Morning Ride')?.badgeLabel).toBe('ACTUAL');
  });
});

describe('buildMacroExplainModel — macros', () => {
  it('includes window allocations, energy, and progress for carbs', () => {
    const model = buildMacroExplainModel({
      label: 'Carbs',
      day: dayWithPlan(),
      weightKg: 75,
    });

    expect(model.unit).toBe('g');
    expect(model.rows.some((r) => r.label === 'Workout Window Allocation')).toBe(true);
    expect(model.rows.some((r) => r.label === 'Daily Base Allocation')).toBe(true);
    expect(model.rows.find((r) => r.label === 'Energy Contribution')?.value).toBe('1600 kcal');
    expect(model.rows.find((r) => r.label === 'Progress Today')?.value).toBe('360g remaining');
  });

  it('reports grams above target when intake exceeds the goal', () => {
    const model = buildMacroExplainModel({
      label: 'Protein',
      day: dayWithPlan({ protein: 180 }),
      weightKg: 70,
    });
    expect(model.rows.find((r) => r.label === 'Progress Today')?.value).toBe('20g above target');
  });
});

describe('buildCoachTip', () => {
  it('varies by metric and fuel state', () => {
    expect(buildCoachTip('Calories', 0, 3000, 2)).toContain('dynamic');
    expect(buildCoachTip('Carbs', 10, 400, 3)).toContain('high-output');
    expect(buildCoachTip('Protein', 200, 160, 2)).toContain('already covered');
  });
});
