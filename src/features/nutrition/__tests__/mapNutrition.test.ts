import { describe, expect, it } from 'vitest';

import {
  canExplainMetric,
  emptyQuickLogForm,
  formatMacroGrams,
  formatWindowTime,
  fuelStateLabel,
  goalProgressPct,
  localDateYmd,
  nutritionWebPath,
  pickNextFuelingWindow,
  pickTodayNutrition,
  quickLogHasContent,
  roundMacro,
  toNutritionUploadPayload,
} from '../mapNutrition';

describe('pickTodayNutrition', () => {
  it('maps today’s macros and water from list payload', () => {
    const today = '2026-07-19';
    const result = pickTodayNutrition(
      {
        success: true,
        nutrition: [
          {
            id: 'n1',
            date: today,
            calories: 1840,
            protein: 120.5,
            carbs: 200,
            fat: 55,
            waterMl: 1500,
          },
          { id: 'n0', date: '2026-07-18', calories: 900 },
        ],
      },
      today
    );

    expect(result.id).toBe('n1');
    expect(result.calories).toBe(1840);
    expect(result.protein).toBe(120.5);
    expect(result.waterMl).toBe(1500);
    expect(result.isEmpty).toBe(false);
  });

  it('returns empty day when no row for today', () => {
    const today = '2026-07-19';
    const result = pickTodayNutrition(
      { nutrition: [{ id: 'n0', date: '2026-07-18', calories: 900 }] },
      today
    );
    expect(result.isEmpty).toBe(true);
    expect(result.date).toBe(today);
    expect(result.calories).toBe(0);
    expect(result.hasGoals).toBe(false);
    expect(result.caloriesGoal).toBeNull();
  });

  it('maps canonical goals and fluid target from the fueling plan', () => {
    const today = '2026-07-20';
    const result = pickTodayNutrition(
      {
        nutrition: [
          {
            id: 'n2',
            date: today,
            calories: 350,
            protein: 0,
            carbs: 0,
            fat: 0,
            waterMl: 500,
            caloriesGoal: 1840.4,
            proteinGoal: 153,
            carbsGoal: 287,
            fatGoal: 96,
            fuelingPlan: { dailyTotals: { fluid: 2000.6, carbs: 287 } },
          },
        ],
      },
      today
    );

    expect(result.caloriesGoal).toBe(1840);
    expect(result.proteinGoal).toBe(153);
    expect(result.carbsGoal).toBe(287);
    expect(result.fatGoal).toBe(96);
    expect(result.fluidGoalMl).toBe(2001);
    expect(result.hasGoals).toBe(true);
  });

  it('treats missing or zero goals as null', () => {
    const today = '2026-07-20';
    const result = pickTodayNutrition(
      {
        nutrition: [
          { id: 'n3', date: today, calories: 100, caloriesGoal: 0, fuelingPlan: null },
        ],
      },
      today
    );
    expect(result.caloriesGoal).toBeNull();
    expect(result.fluidGoalMl).toBeNull();
    expect(result.hasGoals).toBe(false);
  });

  it('maps fuelState from the fueling plan', () => {
    const today = '2026-07-20';
    const result = pickTodayNutrition(
      {
        nutrition: [
          {
            id: 'n4',
            date: today,
            calories: 100,
            fuelingPlan: { dailyTotals: { fuelState: 3 } },
          },
        ],
      },
      today
    );
    expect(result.fuelState).toBe(3);
    expect(fuelStateLabel(3)).toBe('Performance day');
    expect(fuelStateLabel(2)).toBe('Steady day');
    expect(fuelStateLabel(1)).toBe('Eco day');
  });

  it('treats an out-of-range fuelState as null', () => {
    const today = '2026-07-20';
    const result = pickTodayNutrition(
      {
        nutrition: [
          { id: 'n5', date: today, calories: 100, fuelingPlan: { dailyTotals: { fuelState: 7 } } },
        ],
      },
      today
    );
    expect(result.fuelState).toBeNull();
  });

  it('retains fueling-plan analysis fields for explain sheets', () => {
    const today = '2026-07-22';
    const result = pickTodayNutrition(
      {
        nutrition: [
          {
            id: 'n6',
            date: today,
            calories: 0,
            caloriesGoal: 3392,
            fuelingPlan: {
              dailyTotals: {
                fluid: 3000,
                fuelState: 2,
                baseCalories: 2300,
                baseCaloriesMode: 'MANUAL_NON_EXERCISE',
                activityCalories: 696,
                adjustmentCalories: -599,
                workoutCalories: [
                  { title: 'Full-Body Strength Session', calories: 412, sourceType: 'estimated' },
                ],
              },
              windows: [
                { type: 'PRE_WORKOUT', targetCarbs: 40, targetProtein: 10, targetFat: 0 },
                { type: 'DAILY_BASE', targetCarbs: 200, targetProtein: 80, targetFat: 50 },
              ],
            },
          },
        ],
      },
      today
    );

    expect(result.fuelingPlan).not.toBeNull();
    expect(result.fuelingPlan?.dailyTotals.baseCalories).toBe(2300);
    expect(result.fuelingPlan?.dailyTotals.baseCaloriesMode).toBe('MANUAL_NON_EXERCISE');
    expect(result.fuelingPlan?.dailyTotals.workoutCalories).toEqual([
      { title: 'Full-Body Strength Session', calories: 412, sourceType: 'estimated' },
    ]);
    expect(result.fuelingPlan?.windows).toHaveLength(2);
    expect(canExplainMetric(result, 'Calories')).toBe(true);
    expect(canExplainMetric(result, 'Carbs')).toBe(true);
  });

  it('leaves fuelingPlan null and blocks explain when there is no plan or goal', () => {
    const today = '2026-07-22';
    const result = pickTodayNutrition(
      { nutrition: [{ id: 'n7', date: today, calories: 100, fuelingPlan: null }] },
      today
    );
    expect(result.fuelingPlan).toBeNull();
    expect(canExplainMetric(result, 'Calories')).toBe(false);
    expect(canExplainMetric(result, 'Fat')).toBe(false);
  });
});

describe('pickNextFuelingWindow', () => {
  const now = new Date('2026-07-20T12:00:00.000Z');

  it('picks the earliest window that has not ended yet', () => {
    const result = pickNextFuelingWindow(
      {
        windows: [
          {
            type: 'PRE_WORKOUT',
            startTime: '2026-07-20T09:00:00.000Z',
            endTime: '2026-07-20T09:30:00.000Z',
            targetCarbs: 20,
            targetProtein: 5,
          },
          {
            type: 'DAILY_BASE',
            slotName: 'Dinner',
            startTime: '2026-07-20T18:00:00.000Z',
            endTime: '2026-07-20T19:00:00.000Z',
            targetCarbs: 72.4,
            targetProtein: 38,
          },
          {
            type: 'POST_WORKOUT',
            startTime: '2026-07-20T20:00:00.000Z',
            endTime: '2026-07-20T21:00:00.000Z',
            targetCarbs: 40,
            targetProtein: 25,
          },
        ],
      },
      now
    );

    expect(result?.label).toBe('Dinner');
    expect(result?.targetCarbs).toBe(72);
    expect(result?.targetProtein).toBe(38);
    expect(formatWindowTime(result!.startTime)).toMatch(/^\d{2}:\d{2}$/);
  });

  it('falls back to a type label when slotName is absent', () => {
    const result = pickNextFuelingWindow(
      {
        windows: [
          {
            type: 'POST_WORKOUT',
            startTime: '2026-07-20T20:00:00.000Z',
            endTime: '2026-07-20T21:00:00.000Z',
            targetCarbs: 40,
            targetProtein: 25,
          },
        ],
      },
      now
    );
    expect(result?.label).toBe('Post-workout');
  });

  it('returns null when there are no future windows', () => {
    const result = pickNextFuelingWindow(
      {
        windows: [
          {
            type: 'DAILY_BASE',
            startTime: '2026-07-20T06:00:00.000Z',
            endTime: '2026-07-20T07:00:00.000Z',
            targetCarbs: 10,
            targetProtein: 5,
          },
        ],
      },
      now
    );
    expect(result).toBeNull();
  });

  it('returns null for malformed payloads', () => {
    expect(pickNextFuelingWindow(null)).toBeNull();
    expect(pickNextFuelingWindow({})).toBeNull();
    expect(pickNextFuelingWindow({ windows: 'nope' })).toBeNull();
  });
});

describe('toNutritionUploadPayload', () => {
  it('builds POST item with meal and macros', () => {
    const loggedAt = new Date('2026-07-19T08:30:00.000Z');
    const payload = toNutritionUploadPayload(
      {
        meal: 'BREAKFAST',
        name: '  Oats  ',
        calories: '320',
        protein: '18',
        carbs: '45.5',
        fat: '8',
      },
      '2026-07-19',
      loggedAt
    );

    expect(payload.date).toBe('2026-07-19');
    expect(payload.items).toHaveLength(1);
    expect(payload.items[0]).toMatchObject({
      name: 'Oats',
      meal: 'BREAKFAST',
      calories: 320,
      protein: 18,
      carbs: 45.5,
      fat: 8,
      logged_at: '2026-07-19T08:30:00.000Z',
    });
  });

  it('requires content via quickLogHasContent', () => {
    expect(quickLogHasContent(emptyQuickLogForm())).toBe(false);
    expect(quickLogHasContent({ ...emptyQuickLogForm(), calories: '100' })).toBe(true);
  });
});

describe('helpers', () => {
  it('computes clamped goal progress', () => {
    expect(goalProgressPct(0, 200)).toBe(0);
    expect(goalProgressPct(50, 200)).toBe(25);
    expect(goalProgressPct(300, 200)).toBe(100);
    expect(goalProgressPct(50, null)).toBeNull();
    expect(goalProgressPct(50, 0)).toBeNull();
  });

  it('formats macros and web path', () => {
    expect(formatMacroGrams(12)).toBe('12');
    expect(formatMacroGrams(12.5)).toBe('12.5');
    expect(formatMacroGrams(28.000000000000004)).toBe('28');
    expect(formatMacroGrams(28.600000000000002)).toBe('28.6');
    expect(formatMacroGrams(28.6666)).toBe('28.7');
    expect(roundMacro(28.600000000000002)).toBe(28.6);
    expect(nutritionWebPath()).toBe('/nutrition');
    expect(localDateYmd(new Date('2026-07-19T15:00:00'))).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
