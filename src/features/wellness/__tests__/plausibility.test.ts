import { describe, expect, it } from 'vitest';

import {
  isPlausibleRestingHr,
  isPlausibleSleepHours,
  isPlausibleWeightKg,
  plausibleRestingHrHistory,
  plausibleSleepHistory,
} from '../plausibility';

describe('isPlausibleSleepHours', () => {
  it('rejects sync artifacts and extremes', () => {
    expect(isPlausibleSleepHours(0.2)).toBe(false);
    expect(isPlausibleSleepHours(0.9)).toBe(false);
    expect(isPlausibleSleepHours(17)).toBe(false);
    expect(isPlausibleSleepHours(null)).toBe(false);
  });

  it('accepts a normal night', () => {
    expect(isPlausibleSleepHours(1)).toBe(true);
    expect(isPlausibleSleepHours(7.5)).toBe(true);
    expect(isPlausibleSleepHours(16)).toBe(true);
  });
});

describe('isPlausibleRestingHr', () => {
  it('gates extreme bpm', () => {
    expect(isPlausibleRestingHr(20)).toBe(false);
    expect(isPlausibleRestingHr(130)).toBe(false);
    expect(isPlausibleRestingHr(48)).toBe(true);
  });
});

describe('isPlausibleWeightKg', () => {
  it('rejects >10% day jumps', () => {
    expect(isPlausibleWeightKg(80, 70)).toBe(false);
    expect(isPlausibleWeightKg(72, 70)).toBe(true);
    expect(isPlausibleWeightKg(72, null)).toBe(true);
  });
});

describe('history filters', () => {
  it('keeps only plausible samples', () => {
    expect(plausibleSleepHistory([0.2, 7, null, 18, 8])).toEqual([7, 8]);
    expect(plausibleRestingHrHistory([10, 50, 200])).toEqual([50]);
  });
});
