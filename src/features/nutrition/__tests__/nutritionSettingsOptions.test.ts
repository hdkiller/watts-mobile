import { describe, expect, it } from 'vitest';

import {
  ACTIVITY_LEVEL_OPTIONS,
  ALLERGY_OPTIONS,
  BASE_CALORIES_MODE_OPTIONS,
  DIETARY_OPTIONS,
  GOAL_PROFILE_OPTIONS,
  INTOLERANCE_OPTIONS,
  LIFESTYLE_OPTIONS,
  PAL_MULTIPLIERS,
  PHASE_PRESETS,
  SUPPLEMENT_OPTIONS,
  TRAINING_PHASE_OPTIONS,
} from '../nutritionSettingsOptions';

describe('nutritionSettingsOptions', () => {
  it('contains valid activity level and goal profile options', () => {
    expect(ACTIVITY_LEVEL_OPTIONS.map((o) => o.value)).toContain('SEDENTARY');
    expect(ACTIVITY_LEVEL_OPTIONS.map((o) => o.value)).toContain('ACTIVE');
    expect(BASE_CALORIES_MODE_OPTIONS.map((o) => o.value)).toEqual(['AUTO', 'MANUAL_NON_EXERCISE']);
    expect(GOAL_PROFILE_OPTIONS.map((o) => o.value)).toEqual(['LOSE', 'MAINTAIN', 'GAIN']);
  });

  it('contains dietary, allergy, intolerance, lifestyle, supplement options', () => {
    expect(DIETARY_OPTIONS.length).toBeGreaterThan(5);
    expect(ALLERGY_OPTIONS.length).toBeGreaterThan(5);
    expect(INTOLERANCE_OPTIONS.length).toBeGreaterThan(5);
    expect(LIFESTYLE_OPTIONS.length).toBeGreaterThan(5);
    expect(SUPPLEMENT_OPTIONS.length).toBeGreaterThan(5);
    expect(TRAINING_PHASE_OPTIONS.length).toBe(4);
  });

  it('defines phase presets with macro scaling factors matching web spec', () => {
    expect(PHASE_PRESETS.BASE).toEqual({
      baseProteinPerKg: 1.8,
      baseFatPerKg: 1.2,
      carbScalingFactor: 0.8,
    });
    expect(PHASE_PRESETS.BUILD).toEqual({
      baseProteinPerKg: 1.6,
      baseFatPerKg: 0.9,
      carbScalingFactor: 1.1,
    });
    expect(PHASE_PRESETS.RACE).toEqual({
      baseProteinPerKg: 1.4,
      baseFatPerKg: 0.6,
      carbScalingFactor: 1.4,
    });
  });

  it('defines valid PAL multipliers for BMR auto mode', () => {
    expect(PAL_MULTIPLIERS.SEDENTARY).toBe(1.2);
    expect(PAL_MULTIPLIERS.LIGHTLY_ACTIVE).toBe(1.375);
    expect(PAL_MULTIPLIERS.MODERATELY_ACTIVE).toBe(1.55);
    expect(PAL_MULTIPLIERS.VERY_ACTIVE).toBe(1.725);
    expect(PAL_MULTIPLIERS.EXTRA_ACTIVE).toBe(1.9);
  });
});
