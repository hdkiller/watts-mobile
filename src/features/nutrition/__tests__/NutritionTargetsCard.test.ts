import { describe, expect, it } from 'vitest';

import { fuelStateLabel, goalProgressPct } from '../mapNutrition';
import type { NutritionDayTotals } from '../types';

describe('NutritionTargetsCard data mapping and math', () => {
  it('calculates remaining calories correctly', () => {
    const day: NutritionDayTotals = {
      id: 'test-1',
      date: '2026-07-22',
      calories: 300,
      protein: 10,
      carbs: 54,
      fat: 6,
      waterMl: 400,
      isEmpty: false,
      caloriesGoal: 2624,
      proteinGoal: 153,
      carbsGoal: 287,
      fatGoal: 96,
      fluidGoalMl: 3348,
      hasGoals: true,
      fuelState: 1,
      fuelingPlan: null,
    };

    const remaining = Math.max(0, (day.caloriesGoal ?? 0) - day.calories);
    expect(remaining).toBe(2324);
    expect(fuelStateLabel(day.fuelState!)).toBe('Eco day');
    expect(goalProgressPct(day.calories, day.caloriesGoal)).toBe(11);
    expect(goalProgressPct(day.carbs, day.carbsGoal)).toBe(19);
    expect(goalProgressPct(day.protein, day.proteinGoal)).toBe(7);
    expect(goalProgressPct(day.fat, day.fatGoal)).toBe(6);
    expect(goalProgressPct(day.waterMl, day.fluidGoalMl)).toBe(12);
  });
});
