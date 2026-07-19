import { describe, expect, it } from 'vitest';

import { formStatusTextClass, mapPmcChartSeries, mapPmcPayload, roundLoad } from '../mapPmc';

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
