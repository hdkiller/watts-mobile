/**
 * Pure shape helpers for the HealthKit reader — no native imports, so the
 * quantity/duration/lap logic is testable without a simulator.
 */
import type { WorkoutLap } from '../types';

export type HkQuantity = { unit?: string; quantity?: number } | number | undefined;

export function quantityValue(q: HkQuantity): { value: number; unit?: string } | undefined {
  if (typeof q === 'number') return Number.isFinite(q) ? { value: q } : undefined;
  if (q && typeof q.quantity === 'number' && Number.isFinite(q.quantity)) {
    return { value: q.quantity, unit: q.unit };
  }
  return undefined;
}

export function kilocalories(q: HkQuantity): number | undefined {
  const v = quantityValue(q);
  if (!v) return undefined;
  if (v.unit && /kj/i.test(v.unit)) return v.value / 4.184;
  return v.value; // kcal
}

export function meters(q: HkQuantity): number | undefined {
  const v = quantityValue(q);
  if (!v) return undefined;
  if (v.unit === 'km') return v.value * 1000;
  if (v.unit === 'mi') return v.value * 1609.344;
  return v.value; // m / "meters"
}

/**
 * HealthKit serializes `HKWorkout.duration` as a Quantity in seconds, never a
 * bare number. Reading it as a number silently falls through to elapsed
 * wall-clock time, which over-reports any workout that was paused.
 */
export function seconds(q: HkQuantity): number | undefined {
  const v = quantityValue(q);
  if (!v) return undefined;
  if (v.unit === 'min') return v.value * 60;
  if (v.unit === 'hr') return v.value * 3600;
  if (v.unit === 'ms') return v.value / 1000;
  return v.value; // s
}

/** HKWorkoutEventType raw values used to recover splits. */
export const HK_EVENT_LAP = 3;
export const HK_EVENT_SEGMENT = 7;

export type HkWorkoutShape = {
  activities?: readonly { startDate: Date | string; endDate: Date | string }[];
  events?: readonly { type: number; startDate: Date | string; endDate: Date | string }[];
};

/**
 * Laps from the workout's own structure.
 * `activities` is the modern multi-segment representation; older workouts carry
 * `segment` ranges or bare `lap` markers that bound consecutive splits.
 * HealthKit exposes no per-lap distance, so the FIT encoder writes its invalid
 * sentinel for that field.
 */
export function lapsFromWorkout(
  workout: HkWorkoutShape,
  start: Date,
  end: Date
): WorkoutLap[] | undefined {
  const ms = (d: Date | string) => new Date(d).getTime();
  const iso = (t: number) => new Date(t).toISOString();
  const ranged = (a: number, b: number) => Number.isFinite(a) && Number.isFinite(b) && b > a;

  const activities = (workout.activities ?? [])
    .map((a) => ({ from: ms(a.startDate), to: ms(a.endDate) }))
    .filter((a) => ranged(a.from, a.to));
  if (activities.length > 1) {
    return activities.map((a) => ({ startedAt: iso(a.from), endedAt: iso(a.to) }));
  }

  const events = workout.events ?? [];
  const segments = events
    .filter((e) => e.type === HK_EVENT_SEGMENT)
    .map((e) => ({ from: ms(e.startDate), to: ms(e.endDate) }))
    .filter((s) => ranged(s.from, s.to))
    .sort((a, b) => a.from - b.from);
  if (segments.length > 1) {
    return segments.map((s) => ({ startedAt: iso(s.from), endedAt: iso(s.to) }));
  }

  // Lap events are instantaneous markers — each one closes the preceding split.
  const startMs = start.getTime();
  const endMs = end.getTime();
  if (!ranged(startMs, endMs)) return undefined;
  const markers = [
    ...new Set(
      events
        .filter((e) => e.type === HK_EVENT_LAP)
        .map((e) => ms(e.startDate))
        .filter((t) => Number.isFinite(t) && t > startMs && t < endMs)
    ),
  ].sort((a, b) => a - b);
  if (!markers.length) return undefined;

  const bounds = [startMs, ...markers, endMs];
  const laps: WorkoutLap[] = [];
  for (let i = 1; i < bounds.length; i++) {
    const from = bounds[i - 1]!;
    const to = bounds[i]!;
    if (to > from) laps.push({ startedAt: iso(from), endedAt: iso(to) });
  }
  return laps.length > 1 ? laps : undefined;
}
