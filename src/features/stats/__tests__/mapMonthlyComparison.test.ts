import { describe, expect, it } from 'vitest';

import {
  formatDeltaPercent,
  mapMonthlyComparisonPayload,
  summarizeMonthlyProgress,
} from '../mapMonthlyComparison';

function day(tss: number) {
  return { tss, duration: 0, distance: 0, elevation: 0, count: 1 };
}

describe('mapMonthlyComparisonPayload / summarizeMonthlyProgress', () => {
  it('maps payload and computes month-to-date delta', () => {
    const payload = mapMonthlyComparisonPayload({
      todayDay: 10,
      currentMonth: {
        name: 'July',
        daily: { 10: day(50) },
        cumulative: {
          10: { tss: 400, duration: 12, distance: 100, elevation: 1000, count: 8 },
        },
      },
      lastMonth: {
        name: 'June',
        daily: { 10: day(40) },
        cumulative: {
          10: { tss: 320, duration: 10, distance: 80, elevation: 800, count: 7 },
        },
      },
    });

    expect(payload.currentMonthName).toBe('July');
    expect(payload.todayDay).toBe(10);

    const summary = summarizeMonthlyProgress(payload, 'tss');
    expect(summary.currentTotal).toBe(400);
    expect(summary.lastTotal).toBe(320);
    expect(summary.percentDiff).toBeCloseTo(25);
    expect(formatDeltaPercent(summary.percentDiff)).toBe('+25%');
  });

  it('uses 100% when last month is zero and current has volume', () => {
    const payload = mapMonthlyComparisonPayload({
      todayDay: 5,
      currentMonth: {
        name: 'July',
        cumulative: {
          5: { tss: 100, duration: 2, distance: 0, elevation: 0, count: 2 },
        },
      },
      lastMonth: {
        name: 'June',
        cumulative: {
          5: { tss: 0, duration: 0, distance: 0, elevation: 0, count: 0 },
        },
      },
    });
    expect(summarizeMonthlyProgress(payload, 'tss').percentDiff).toBe(100);
  });
});
