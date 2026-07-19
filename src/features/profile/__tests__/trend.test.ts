import { describe, expect, it } from 'vitest';

import { calculateTrend } from '../trend';

describe('calculateTrend', () => {
  it('returns null if current value is null or undefined', () => {
    expect(calculateTrend(null, [60, 61, 62])).toBeNull();
    expect(calculateTrend(undefined, [60, 61, 62])).toBeNull();
  });

  it('returns null if history is empty or contains no finite numbers', () => {
    expect(calculateTrend(60, [])).toBeNull();
    expect(calculateTrend(60, [null, undefined])).toBeNull();
  });

  it('calculates increase correctly', () => {
    // Mean of [50, 50, 50] is 50. Current is 55. (55 - 50) / 50 = +10%
    expect(calculateTrend(55, [50, 50, 50])).toBe(10);
  });

  it('calculates decrease correctly', () => {
    // Mean of [100, 100] is 100. Current is 80. (80 - 100) / 100 = -20%
    expect(calculateTrend(80, [100, 100])).toBe(-20);
  });

  it('calculates RHR style minor decrease correctly', () => {
    // Mean of [61, 61.4, 61.2] is 61.2. Current is 60. (60 - 61.2) / 61.2 = -1.96%
    expect(calculateTrend(60, [61, 61.4, 61.2])).toBe(-2);
  });

  it('filters out null or invalid values from history', () => {
    expect(calculateTrend(55, [50, null, 50, undefined])).toBe(10);
  });

  it('returns null if history mean is 0 or negative', () => {
    expect(calculateTrend(50, [0, -10, 0])).toBeNull();
  });
});
