import { describe, expect, it } from 'vitest';

import {
  downsamplePoints,
  mapActivityStreamCharts,
  mapPowerCurveCharts,
  mapZoneBars,
} from '../mapCharts';

describe('downsamplePoints', () => {
  it('returns all points when under the cap', () => {
    const points = downsamplePoints([0, 1, 2], [10, 20, 30], 200);
    expect(points).toEqual([
      { x: 0, y: 10 },
      { x: 1, y: 20 },
      { x: 2, y: 30 },
    ]);
  });

  it('caps length when series is long', () => {
    const xs = Array.from({ length: 1000 }, (_, i) => i);
    const ys = Array.from({ length: 1000 }, (_, i) => i * 2);
    const points = downsamplePoints(xs, ys, 50);
    expect(points).toHaveLength(50);
    expect(points[0]).toEqual({ x: 0, y: 0 });
    expect(points[49]?.x).toBe(999);
  });
});

describe('mapZoneBars', () => {
  it('maps counts to fractions and labels', () => {
    const bars = mapZoneBars(
      [60, 120, 0],
      [
        { name: 'Z1', min: 100, max: 150 },
        { name: 'Z2', min: 150, max: 200 },
      ],
      'W'
    );
    expect(bars).toHaveLength(2);
    expect(bars[0]?.minutes).toBe(1);
    expect(bars[1]?.fraction).toBeCloseTo(120 / 180);
    expect(bars[0]?.detail).toContain('W');
  });

  it('returns empty when all zeros', () => {
    expect(mapZoneBars([0, 0], [], 'W')).toEqual([]);
  });
});

describe('mapActivityStreamCharts', () => {
  it('builds power and HR series plus power zones', () => {
    const charts = mapActivityStreamCharts({
      time: [0, 1, 2, 3],
      watts: [100, 120, 140, 130],
      heartrate: [120, 125, 130, 128],
      powerZoneTimes: [30, 90],
      powerZones: [
        { name: 'Z2', min: 150, max: 200 },
        { name: 'Z3', min: 200, max: 250 },
      ],
    });
    expect(charts?.series.map((s) => s.key)).toEqual(['watts', 'heartrate']);
    expect(charts?.zones?.channelLabel).toBe('Power zones');
    expect(charts?.zones?.bars).toHaveLength(2);
  });

  it('returns null when no chartable data', () => {
    expect(mapActivityStreamCharts({})).toBeNull();
  });
});

describe('mapPowerCurveCharts', () => {
  it('maps curve points when hasPowerData', () => {
    const curve = mapPowerCurveCharts({
      hasPowerData: true,
      powerCurve: [
        { duration: 5, durationLabel: '5s', power: 400 },
        { duration: 60, durationLabel: '1m', power: 300 },
      ],
      summary: { peak20min: 250 },
    });
    expect(curve?.points).toEqual([
      { label: '5s', power: 400 },
      { label: '1m', power: 300 },
    ]);
    expect(curve?.peak20min).toBe(250);
  });

  it('returns null without power data', () => {
    expect(mapPowerCurveCharts({ hasPowerData: false })).toBeNull();
  });
});
