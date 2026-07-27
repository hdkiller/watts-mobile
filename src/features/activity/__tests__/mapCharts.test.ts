import { describe, expect, it } from 'vitest';

import { mapActivityStreamCharts, mapPowerCurveCharts, mapZoneBars } from '../mapCharts';

describe('mapZoneBars', () => {
  it('maps counts to fractions and labels', () => {
    const bars = mapZoneBars(
      [60, 120, 0],
      [
        { name: 'Z1', min: 100, max: 150 },
        { name: 'Z2', min: 150, max: 200 },
      ],
      'W',
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
    expect(charts?.series[0]?.points).toHaveLength(4);
  });

  it('retains aligned terrain streams without consuming detected climbs', () => {
    const charts = mapActivityStreamCharts({
      time: [0, 10, 20],
      distance: [0, 100, 200],
      altitude: [10, 12, 15],
      grade: [0, 2, 3],
      cadence: [80, 82, 84],
      temp: [18, 18.5, 19],
    });

    expect(charts?.terrain?.points).toHaveLength(3);
    expect(charts?.terrain?.points[1]).toMatchObject({
      timeSec: 10,
      distanceM: 100,
      altitudeM: 12,
      cadence: 82,
      tempC: 18.5,
    });
  });

  it('returns null when no chartable data', () => {
    expect(mapActivityStreamCharts({})).toBeNull();
  });

  it('keeps stream charts but omits terrain when altitude is unavailable', () => {
    const charts = mapActivityStreamCharts({
      time: [0, 1, 2],
      watts: [100, 150, 125],
      distance: [0, 10, 20],
    });

    expect(charts?.series.map((series) => series.key)).toEqual(['watts']);
    expect(charts?.terrain).toBeNull();
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
