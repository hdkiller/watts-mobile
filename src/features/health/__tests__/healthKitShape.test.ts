import { describe, expect, it } from 'vitest';

import {
  kilocalories,
  lapsFromWorkout,
  meters,
  seconds,
  type HkWorkoutShape,
} from '../readers/healthKitShape';

const start = new Date('2026-07-21T06:00:00.000Z');
const end = new Date('2026-07-21T07:00:00.000Z');

function at(minutes: number): Date {
  return new Date(start.getTime() + minutes * 60_000);
}

describe('seconds', () => {
  it('reads HealthKit’s Quantity duration rather than falling through', () => {
    // HKWorkout.duration always serializes as { unit: 's', quantity }. A
    // `typeof === "number"` check misses it and silently uses elapsed time,
    // which over-reports every paused workout.
    expect(seconds({ unit: 's', quantity: 3210 })).toBe(3210);
  });

  it('normalizes the other time units HealthKit may report', () => {
    expect(seconds({ unit: 'min', quantity: 90 })).toBe(5400);
    expect(seconds({ unit: 'hr', quantity: 1.5 })).toBe(5400);
    expect(seconds({ unit: 'ms', quantity: 90_000 })).toBe(90);
  });

  it('accepts a bare number and rejects unusable input', () => {
    expect(seconds(1200)).toBe(1200);
    expect(seconds(undefined)).toBeUndefined();
    expect(seconds({ unit: 's' })).toBeUndefined();
    expect(seconds(Number.NaN)).toBeUndefined();
  });
});

describe('kilocalories', () => {
  it('passes kcal through and converts kJ', () => {
    expect(kilocalories({ unit: 'kcal', quantity: 850 })).toBe(850);
    expect(kilocalories({ unit: 'kJ', quantity: 4184 })).toBeCloseTo(1000, 6);
  });

  it('does not mistake kcal for kJ', () => {
    expect(kilocalories({ unit: 'kcal', quantity: 100 })).toBe(100);
  });
});

describe('meters', () => {
  it('handles the unit strings the bridge actually emits', () => {
    expect(meters({ unit: 'meters', quantity: 42_195 })).toBe(42_195);
    expect(meters({ unit: 'm', quantity: 5000 })).toBe(5000);
    expect(meters({ unit: 'km', quantity: 42.195 })).toBeCloseTo(42_195, 6);
    expect(meters({ unit: 'mi', quantity: 1 })).toBeCloseTo(1609.344, 6);
  });
});

describe('lapsFromWorkout', () => {
  it('prefers workout activities when the session has several', () => {
    const workout: HkWorkoutShape = {
      activities: [
        { startDate: at(0), endDate: at(20) },
        { startDate: at(20), endDate: at(40) },
        { startDate: at(40), endDate: at(60) },
      ],
    };

    const laps = lapsFromWorkout(workout, start, end);
    expect(laps).toHaveLength(3);
    expect(laps?.[0]).toEqual({
      startedAt: at(0).toISOString(),
      endedAt: at(20).toISOString(),
    });
  });

  it('falls back to segment events', () => {
    const workout: HkWorkoutShape = {
      activities: [],
      events: [
        { type: 7, startDate: at(30), endDate: at(60) },
        { type: 7, startDate: at(0), endDate: at(30) },
        { type: 1, startDate: at(10), endDate: at(10) }, // pause — not a split
      ],
    };

    const laps = lapsFromWorkout(workout, start, end);
    expect(laps).toHaveLength(2);
    // Sorted into time order regardless of the order HealthKit returned them.
    expect(laps?.[0]?.startedAt).toBe(at(0).toISOString());
    expect(laps?.[1]?.startedAt).toBe(at(30).toISOString());
  });

  it('derives splits from instantaneous lap markers', () => {
    const workout: HkWorkoutShape = {
      events: [
        { type: 3, startDate: at(15), endDate: at(15) },
        { type: 3, startDate: at(45), endDate: at(45) },
      ],
    };

    expect(lapsFromWorkout(workout, start, end)).toEqual([
      { startedAt: at(0).toISOString(), endedAt: at(15).toISOString() },
      { startedAt: at(15).toISOString(), endedAt: at(45).toISOString() },
      { startedAt: at(45).toISOString(), endedAt: at(60).toISOString() },
    ]);
  });

  it('ignores markers outside the workout bounds and de-duplicates them', () => {
    const workout: HkWorkoutShape = {
      events: [
        { type: 3, startDate: at(-10), endDate: at(-10) },
        { type: 3, startDate: at(30), endDate: at(30) },
        { type: 3, startDate: at(30), endDate: at(30) },
        { type: 3, startDate: at(90), endDate: at(90) },
      ],
    };

    expect(lapsFromWorkout(workout, start, end)).toEqual([
      { startedAt: at(0).toISOString(), endedAt: at(30).toISOString() },
      { startedAt: at(30).toISOString(), endedAt: at(60).toISOString() },
    ]);
  });

  it('returns undefined for an unstructured workout', () => {
    expect(lapsFromWorkout({}, start, end)).toBeUndefined();
    expect(lapsFromWorkout({ activities: [], events: [] }, start, end)).toBeUndefined();
  });

  it('does not invent a single lap spanning the whole workout', () => {
    const workout: HkWorkoutShape = {
      activities: [{ startDate: at(0), endDate: at(60) }],
    };
    expect(lapsFromWorkout(workout, start, end)).toBeUndefined();
  });

  it('drops zero-length and malformed ranges', () => {
    const workout: HkWorkoutShape = {
      activities: [
        { startDate: at(0), endDate: at(0) },
        { startDate: 'not-a-date', endDate: at(30) },
        { startDate: at(30), endDate: at(60) },
      ],
    };
    // Only one usable range remains — not enough to call it a lap structure.
    expect(lapsFromWorkout(workout, start, end)).toBeUndefined();
  });
});
