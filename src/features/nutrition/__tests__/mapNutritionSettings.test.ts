import { describe, expect, it } from 'vitest';

import {
  computeTargetCalories,
  computeTdee,
  defaultAdjustmentForGoal,
  hydrationPresetVolumes,
  mapNutritionSettingsResponse,
  normalizeQuickAddVolumes,
  toNutritionSettingsPayload,
} from '../mapNutritionSettings';
import { DEFAULT_NUTRITION_SETTINGS_FORM } from '../nutritionSettingsTypes';

describe('normalizeQuickAddVolumes', () => {
  it('returns default trio when missing', () => {
    expect(normalizeQuickAddVolumes(undefined)).toEqual([250, 500, 750]);
  });

  it('sorts, clamps length to 3, and fills gaps', () => {
    expect(normalizeQuickAddVolumes([750, 250])).toEqual([250, 750, 750]);
  });

  it('filters invalid volumes', () => {
    expect(normalizeQuickAddVolumes([10, 250, 500, 3000, 750])).toEqual([250, 500, 750]);
  });
});

describe('mapNutritionSettingsResponse', () => {
  it('maps settings + tracking + weight', () => {
    const mapped = mapNutritionSettingsResponse({
      settings: {
        nutritionTrackingEnabled: true,
        bmr: 1700,
        activityLevel: 'VERY_ACTIVE',
        goalProfile: 'LOSE',
        targetAdjustmentPercent: -12,
        quickAddVolumes: [300, 600, 900],
        mealPattern: [{ name: 'Brunch', time: '10:30' }],
        dietaryProfile: ['VEGAN'],
        user: { weight: 72.5 },
      },
    });

    expect(mapped.nutritionTrackingEnabled).toBe(true);
    expect(mapped.bmr).toBe(1700);
    expect(mapped.activityLevel).toBe('VERY_ACTIVE');
    expect(mapped.goalProfile).toBe('LOSE');
    expect(mapped.quickAddVolumes).toEqual([300, 600, 900]);
    expect(mapped.mealPattern).toEqual([{ name: 'Brunch', time: '10:30' }]);
    expect(mapped.dietaryProfile).toEqual(['VEGAN']);
    expect(mapped.weightKg).toBe(72.5);
  });

  it('falls back to defaults for empty payload', () => {
    const mapped = mapNutritionSettingsResponse({});
    expect(mapped.bmr).toBe(DEFAULT_NUTRITION_SETTINGS_FORM.bmr);
    expect(mapped.quickAddVolumes).toEqual([250, 500, 750]);
    expect(mapped.nutritionTrackingEnabled).toBe(false);
  });
});

describe('computeTdee / target calories', () => {
  it('uses BMR × PAL in AUTO mode', () => {
    const form = {
      ...DEFAULT_NUTRITION_SETTINGS_FORM,
      bmr: 1600,
      activityLevel: 'MODERATELY_ACTIVE' as const,
      baseCaloriesMode: 'AUTO' as const,
      targetAdjustmentPercent: 0,
    };
    expect(computeTdee(form)).toBe(Math.round(1600 * 1.55));
    expect(computeTargetCalories(form)).toBe(Math.round(1600 * 1.55));
  });

  it('applies goal adjustment percent', () => {
    const form = {
      ...DEFAULT_NUTRITION_SETTINGS_FORM,
      bmr: 2000,
      activityLevel: 'SEDENTARY' as const,
      baseCaloriesMode: 'AUTO' as const,
      targetAdjustmentPercent: -10,
    };
    expect(computeTargetCalories(form)).toBe(Math.round(2000 * 1.2 * 0.9));
  });
});

describe('toNutritionSettingsPayload / helpers', () => {
  it('normalizes meal names and volumes on save payload', () => {
    const payload = toNutritionSettingsPayload({
      ...DEFAULT_NUTRITION_SETTINGS_FORM,
      mealPattern: [{ name: '  ', time: '' }],
      quickAddVolumes: [900, 300, 600],
    });
    expect(payload.mealPattern[0]).toEqual({ name: 'Meal', time: '08:00' });
    expect(payload.quickAddVolumes).toEqual([300, 600, 900]);
  });

  it('defaultAdjustmentForGoal matches web defaults', () => {
    expect(defaultAdjustmentForGoal('LOSE')).toBe(-15);
    expect(defaultAdjustmentForGoal('GAIN')).toBe(10);
    expect(defaultAdjustmentForGoal('MAINTAIN')).toBe(0);
  });

  it('hydrationPresetVolumes uses settings or fallback', () => {
    expect(hydrationPresetVolumes(null)).toEqual([250, 500, 750]);
    expect(hydrationPresetVolumes([400, 800, 1200])).toEqual([400, 800, 1200]);
  });
});
