import { describe, expect, it } from 'vitest';

import {
  formatDeltaPercent,
  mapMonthlyChartSeries,
  mapMonthlyComparisonPayload,
  summarizeMonthlyProgress,
} from '../mapMonthlyComparison';

function day(tss: number) {
  return { tss, duration: 0, distance: 0, elevation: 0, count: 1 };
}

function cum(tss: number) {
  return { tss, duration: 0, distance: 0, elevation: 0, count: 0 };
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

describe('mapMonthlyChartSeries', () => {
  it('keeps last month cumulative through the full month while current stops at today', () => {
    const currentCumulative: Record<number, ReturnType<typeof cum> | null> = {};
    const lastCumulative: Record<number, ReturnType<typeof cum>> = {};
    for (let d = 1; d <= 31; d++) {
      currentCumulative[d] = d <= 20 ? cum(d * 10) : null;
      lastCumulative[d] = cum(d * 8);
    }

    const payload = mapMonthlyComparisonPayload({
      todayDay: 20,
      currentMonth: { name: 'July', cumulative: currentCumulative },
      lastMonth: { name: 'June', cumulative: lastCumulative },
    });

    const chart = mapMonthlyChartSeries(payload, 'tss', 'cumulative');
    const current = chart.series.find((s) => s.key === 'current');
    const last = chart.series.find((s) => s.key === 'last');

    expect(chart.endDay).toBe(31);
    expect(chart.durationSec).toBe(30);
    expect(current?.points).toHaveLength(20);
    expect(current?.points.at(-1)).toEqual({ x: 19, y: 200 });
    expect(last?.points).toHaveLength(31);
    expect(last?.points.at(-1)).toEqual({ x: 30, y: 248 });
  });

  it('keeps last month daily through the full month while current stops at today', () => {
    const currentDaily: Record<number, ReturnType<typeof day>> = {};
    const lastDaily: Record<number, ReturnType<typeof day>> = {};
    for (let d = 1; d <= 31; d++) {
      currentDaily[d] = day(d <= 10 ? 20 : 0);
      lastDaily[d] = day(d <= 28 ? 15 : 0);
    }

    const payload = mapMonthlyComparisonPayload({
      todayDay: 10,
      currentMonth: { name: 'July', daily: currentDaily, cumulative: {} },
      lastMonth: { name: 'June', daily: lastDaily, cumulative: {} },
    });

    const chart = mapMonthlyChartSeries(payload, 'tss', 'daily');
    const current = chart.series.find((s) => s.key === 'current');
    const last = chart.series.find((s) => s.key === 'last');

    expect(current?.points).toHaveLength(10);
    expect(last?.points).toHaveLength(31);
    expect(last?.points.at(-1)?.x).toBe(30);
  });
});
