import { displayWeightToKg, kgToDisplayWeight } from '@/src/features/profile/mapProfile';
import type { WeightUnits } from '@/src/features/profile/types';

import type { LogFormValues, WellnessDay, WellnessUploadPayload } from './types';
import { clampSubjectiveScore, normalizeStressScore } from './wellnessLabels';

export function localDateYmd(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function parseOptionalNumber(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : undefined;
}

function asSubjective(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  return clampSubjectiveScore(value);
}

export function formHasContent(values: LogFormValues): boolean {
  return Boolean(
    values.mood != null ||
      values.stress != null ||
      values.fatigue != null ||
      values.soreness != null ||
      values.sleepHours.trim() ||
      values.notes.trim() ||
      values.weight.trim()
  );
}

/**
 * Build wellness upload payload. Weight is always sent in kg (server storage unit).
 * Pass `weightUnits` when the form field is in the athlete's display unit.
 */
export function toWellnessPayload(
  values: LogFormValues,
  date = localDateYmd(),
  weightUnits: WeightUnits = 'Kilograms'
): WellnessUploadPayload {
  const payload: WellnessUploadPayload = { date };

  if (values.mood != null) payload.mood = clampSubjectiveScore(values.mood);
  if (values.stress != null) payload.stress = clampSubjectiveScore(values.stress);
  if (values.fatigue != null) payload.fatigue = clampSubjectiveScore(values.fatigue);
  if (values.soreness != null) payload.soreness = clampSubjectiveScore(values.soreness);

  const sleepHours = parseOptionalNumber(values.sleepHours);
  const displayWeight = parseOptionalNumber(values.weight);

  if (sleepHours != null) payload.sleepHours = sleepHours;
  if (displayWeight != null) {
    payload.weight = displayWeightToKg(displayWeight, weightUnits);
  }
  if (values.notes.trim()) payload.comments = values.notes.trim();

  return payload;
}

export function emptyLogForm(): LogFormValues {
  return {
    mood: null,
    stress: null,
    fatigue: null,
    soreness: null,
    sleepHours: '',
    notes: '',
    weight: '',
  };
}

/** Hydrate form from server wellness (weight stored in kg → display units). */
export function formFromWellness(
  day: WellnessDay | null,
  weightUnits: WeightUnits = 'Kilograms'
): LogFormValues {
  if (!day) return emptyLogForm();
  const displayWeight = kgToDisplayWeight(day.weight, weightUnits);
  return {
    mood: day.mood,
    stress: day.stress,
    fatigue: day.fatigue,
    soreness: day.soreness,
    sleepHours: day.sleepHours != null ? String(day.sleepHours) : '',
    notes: day.comments ?? '',
    weight: displayWeight != null ? String(displayWeight) : '',
  };
}

export function pickTodayWellness(rows: unknown[], today = localDateYmd()): WellnessDay | null {
  if (!Array.isArray(rows)) return null;

  for (const row of rows) {
    if (!row || typeof row !== 'object') continue;
    const r = row as Record<string, unknown>;
    const dateRaw = r.date;
    if (dateRaw == null) continue;
    const date = String(dateRaw).slice(0, 10);
    if (date !== today) continue;

    const stressRaw = typeof r.stress === 'number' ? normalizeStressScore(r.stress) : null;

    return {
      id: String(r.id ?? ''),
      date,
      mood: asSubjective(r.mood),
      stress: stressRaw != null ? clampSubjectiveScore(stressRaw) : null,
      fatigue: asSubjective(r.fatigue),
      soreness: asSubjective(r.soreness),
      sleepHours: typeof r.sleepHours === 'number' ? r.sleepHours : null,
      comments: typeof r.comments === 'string' ? r.comments : null,
      weight: typeof r.weight === 'number' ? r.weight : null,
    };
  }

  return null;
}
