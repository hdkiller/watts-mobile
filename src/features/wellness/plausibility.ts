/**
 * Plausibility gates for wellness metrics shown to athletes.
 * Implausible sync artifacts (partial HealthKit samples, etc.) must not get
 * hero treatment or alarming trend badges.
 */

export function isPlausibleSleepHours(hours: number | null | undefined): boolean {
  return typeof hours === 'number' && Number.isFinite(hours) && hours >= 1 && hours <= 16;
}

export function isPlausibleRestingHr(bpm: number | null | undefined): boolean {
  return typeof bpm === 'number' && Number.isFinite(bpm) && bpm >= 25 && bpm <= 120;
}

/** Reject day-to-day weight jumps over 10% (almost always a unit/sync glitch). */
export function isPlausibleWeightKg(
  weight: number | null | undefined,
  previous: number | null | undefined
): boolean {
  if (typeof weight !== 'number' || !Number.isFinite(weight) || weight <= 0) return false;
  if (typeof previous !== 'number' || !Number.isFinite(previous) || previous <= 0) return true;
  return Math.abs(weight - previous) / previous <= 0.1;
}

/** Filter history used for trend baselines so garbage days don't skew %. */
export function plausibleSleepHistory(
  history: (number | null | undefined)[]
): number[] {
  return history.filter((v): v is number => isPlausibleSleepHours(v));
}

export function plausibleRestingHrHistory(
  history: (number | null | undefined)[]
): number[] {
  return history.filter((v): v is number => isPlausibleRestingHr(v));
}
