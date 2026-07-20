import { describe, expect, it } from 'vitest';

import { lastNightSleepWindow, mergeIntervalDurationMs } from '../sleepIntervals';

describe('mergeIntervalDurationMs', () => {
  it('sums disjoint intervals', () => {
    expect(
      mergeIntervalDurationMs([
        { start: 0, end: 1000 },
        { start: 2000, end: 3000 },
      ])
    ).toBe(2000);
  });

  it('coalesces overlaps instead of double-counting', () => {
    // Two sources both covering 0–7h
    const sevenHours = 7 * 60 * 60 * 1000;
    expect(
      mergeIntervalDurationMs([
        { start: 0, end: sevenHours },
        { start: 0, end: sevenHours },
      ])
    ).toBe(sevenHours);

    expect(
      mergeIntervalDurationMs([
        { start: 0, end: 4 * 3600_000 },
        { start: 3 * 3600_000, end: 7 * 3600_000 },
      ])
    ).toBe(7 * 3600_000);
  });
});

describe('lastNightSleepWindow', () => {
  it('starts at local yesterday 18:00', () => {
    const now = new Date(2026, 6, 20, 8, 30, 0);
    const { from, to } = lastNightSleepWindow(now);
    expect(from.getFullYear()).toBe(2026);
    expect(from.getMonth()).toBe(6);
    expect(from.getDate()).toBe(19);
    expect(from.getHours()).toBe(18);
    expect(to).toBe(now);
  });
});
