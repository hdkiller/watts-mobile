import { describe, expect, it } from 'vitest';

import {
  MAX_HR_SAMPLES,
  mergeWorkoutStreams,
  summarizeHeartRate,
  summarizePower,
} from '../readers/workoutStreams';

const base = Date.UTC(2026, 6, 20, 8, 0, 0);

describe('summarizeHeartRate', () => {
  it('returns empty for no usable samples', () => {
    expect(summarizeHeartRate([])).toEqual({});
    expect(summarizeHeartRate([{ t: base, bpm: 0 }])).toEqual({});
    expect(summarizeHeartRate([{ t: base, bpm: 500 }])).toEqual({});
    expect(summarizeHeartRate([{ t: NaN, bpm: 120 }])).toEqual({});
  });

  it('computes avg and max and sorts by time', () => {
    const res = summarizeHeartRate([
      { t: base + 2000, bpm: 150 },
      { t: base, bpm: 120 },
      { t: base + 1000, bpm: 130 },
    ]);
    expect(res.avg).toBe(133);
    expect(res.max).toBe(150);
    expect(res.samples).toHaveLength(3);
    expect(res.samples![0]!.bpm).toBe(120);
    expect(res.samples![2]!.bpm).toBe(150);
  });

  it('downsamples to the cap while keeping the final point', () => {
    const raw = Array.from({ length: MAX_HR_SAMPLES * 3 }, (_, i) => ({
      t: base + i * 1000,
      bpm: 100 + (i % 50),
    }));
    const res = summarizeHeartRate(raw);
    expect(res.samples!.length).toBeLessThanOrEqual(MAX_HR_SAMPLES + 1);
    expect(res.samples![res.samples!.length - 1]!.t).toBe(new Date(raw[raw.length - 1]!.t).toISOString());
    // Average/max come from the full (undownsampled) set.
    expect(res.max).toBe(149);
  });
});

describe('summarizePower', () => {
  it('averages watts from the full stream', () => {
    const res = summarizePower([
      { t: base, watts: 200 },
      { t: base + 1000, watts: 220 },
    ]);
    expect(res.avg).toBe(210);
    expect(res.samples).toHaveLength(2);
  });
});

describe('mergeWorkoutStreams', () => {
  it('merges HR and power onto one timeline', () => {
    const t0 = new Date(base).toISOString();
    const t1 = new Date(base + 1000).toISOString();
    const merged = mergeWorkoutStreams({
      heartRate: [{ t: t0, bpm: 140 }],
      power: [
        { t: t0, watts: 200 },
        { t: t1, watts: 210 },
      ],
    });
    expect(merged).toHaveLength(2);
    expect(merged[0]).toMatchObject({ bpm: 140, watts: 200 });
    expect(merged[1]).toMatchObject({ bpm: 140, watts: 210 });
  });

  it('aligns every available stream and derives route distance', () => {
    const merged = mergeWorkoutStreams({
      heartRate: [{ t: new Date(base).toISOString(), bpm: 140 }],
      power: [{ t: new Date(base + 1000).toISOString(), watts: 210 }],
      cadence: [{ t: new Date(base + 2000).toISOString(), rpm: 88 }],
      speed: [{ t: new Date(base + 3000).toISOString(), mps: 4 }],
      route: [
        {
          t: new Date(base).toISOString(),
          lat: 47.4979,
          lon: 19.0402,
          altitudeMeters: 104,
        },
        {
          t: new Date(base + 3000).toISOString(),
          lat: 47.4989,
          lon: 19.0402,
          altitudeMeters: 107,
        },
      ],
    });

    expect(merged).toHaveLength(4);
    for (const point of merged) {
      expect(point).toEqual(
        expect.objectContaining({
          bpm: 140,
          watts: 210,
          rpm: 88,
          mps: 4,
        })
      );
      expect(point.altitudeMeters).toBeTypeOf('number');
      expect(point.distanceMeters).toBeTypeOf('number');
    }
    expect(merged[0]!.distanceMeters).toBe(0);
    expect(merged.at(-1)!.distanceMeters).toBeGreaterThan(100);
  });
});
