import { describe, expect, it } from 'vitest';

import {
  calculateLoadTrend,
  formStatusTextClass,
  formatTsb,
  mapPmcChartSeries,
  mapPmcPayload,
  mapPmcTrends,
  roundLoad,
} from '../mapPmc';

describe('mapPmcPayload', () => {
  it('maps summary and series', () => {
    const payload = mapPmcPayload({
      data: [
        { date: '2026-07-01T00:00:00.000Z', ctl: 40, atl: 30, tsb: 10, tss: 80 },
        { date: '2026-07-02T00:00:00.000Z', ctl: 41, atl: 32, tsb: 9, tss: 70 },
      ],
      summary: {
        currentCTL: 41.2,
        currentATL: 32.4,
        currentTSB: 8.8,
        avgTSS: 75,
        formStatus: 'Maintenance',
        formColor: 'yellow',
        formDescription: 'Neutral zone',
        lastUpdated: '2026-07-02T00:00:00.000Z',
      },
    });

    expect(payload.summary.formStatus).toBe('Maintenance');
    expect(payload.data).toHaveLength(2);
    expect(payload.data[0]?.date).toBe('2026-07-01');
    expect(roundLoad(payload.summary.currentCTL)).toBe(41);

    const chart = mapPmcChartSeries(payload.data);
    expect(chart.series.map((s) => s.key)).toEqual(['ctl', 'atl', 'tsb']);
    expect(chart.series[0]?.points).toHaveLength(2);
  });
});

describe('formStatusTextClass', () => {
  it('maps known colors', () => {
    expect(formStatusTextClass('green')).toContain('emerald');
    expect(formStatusTextClass('red')).toContain('red');
  });
});

describe('calculateLoadTrend / mapPmcTrends', () => {
  it('matches web-style percent vs prior average', () => {
    // current 5 vs mean of [5.4] ≈ -7% → round to -7; use clearer numbers
    expect(calculateLoadTrend(5, [5.43])).toBe(-8);
    expect(calculateLoadTrend(3, [4.23])).toBe(-29);
    expect(calculateLoadTrend(3, [2.325])).toBe(29);
  });

  it('maps trends from PMC series tip window', () => {
    const payload = mapPmcPayload({
      data: [
        { date: '2026-07-01', ctl: 10, atl: 8, tsb: 2, tss: 50 },
        { date: '2026-07-02', ctl: 10, atl: 8, tsb: 2, tss: 50 },
        { date: '2026-07-03', ctl: 10, atl: 8, tsb: 2, tss: 50 },
        { date: '2026-07-04', ctl: 10, atl: 8, tsb: 2, tss: 50 },
        { date: '2026-07-05', ctl: 10, atl: 8, tsb: 2, tss: 50 },
        { date: '2026-07-06', ctl: 10, atl: 8, tsb: 2, tss: 50 },
        { date: '2026-07-07', ctl: 10, atl: 8, tsb: 2, tss: 50 },
        { date: '2026-07-08', ctl: 10, atl: 8, tsb: 2, tss: 50 },
        { date: '2026-07-09', ctl: 5, atl: 3, tsb: 3, tss: 40 },
      ],
      summary: {
        currentCTL: 5,
        currentATL: 3,
        currentTSB: 3,
        formStatus: 'Fresh',
        formColor: 'green',
        formDescription: '',
        lastUpdated: null,
      },
    });
    const trends = mapPmcTrends(payload);
    expect(trends.ctl).toBe(-50);
    expect(trends.atl).toBe(-62);
    expect(trends.tsb).toBe(50);
  });

  it('omits trends when history empty', () => {
    const payload = mapPmcPayload({
      data: [],
      summary: {
        currentCTL: 5,
        currentATL: 3,
        currentTSB: 3,
        formStatus: 'Fresh',
        formColor: 'green',
        formDescription: '',
        lastUpdated: null,
      },
    });
    expect(mapPmcTrends(payload)).toEqual({ ctl: null, atl: null, tsb: null });
  });

  it('formats signed TSB', () => {
    expect(formatTsb(3.2)).toBe('+3');
    expect(formatTsb(-2.4)).toBe('-2');
    expect(formatTsb(0.2)).toBe('0');
  });
});
