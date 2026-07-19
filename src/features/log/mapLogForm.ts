import type { LogFormValues, WellnessDay, WellnessUploadPayload } from './types';

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

export function formHasContent(values: LogFormValues): boolean {
  return Boolean(
    values.readiness.trim() ||
      values.sleepHours.trim() ||
      values.sleepQuality.trim() ||
      values.notes.trim() ||
      values.weight.trim()
  );
}

export function toWellnessPayload(values: LogFormValues, date = localDateYmd()): WellnessUploadPayload {
  const payload: WellnessUploadPayload = { date };

  const readiness = parseOptionalNumber(values.readiness);
  const sleepHours = parseOptionalNumber(values.sleepHours);
  const sleepQuality = parseOptionalNumber(values.sleepQuality);
  const weight = parseOptionalNumber(values.weight);

  if (readiness != null) payload.readiness = Math.round(readiness);
  if (sleepHours != null) payload.sleepHours = sleepHours;
  if (sleepQuality != null) payload.sleepQuality = Math.round(sleepQuality);
  if (weight != null) payload.weight = weight;
  if (values.notes.trim()) payload.comments = values.notes.trim();

  return payload;
}

export function emptyLogForm(): LogFormValues {
  return {
    readiness: '',
    sleepHours: '',
    sleepQuality: '',
    notes: '',
    weight: '',
  };
}

export function formFromWellness(day: WellnessDay | null): LogFormValues {
  if (!day) return emptyLogForm();
  return {
    readiness: day.readiness != null ? String(day.readiness) : '',
    sleepHours: day.sleepHours != null ? String(day.sleepHours) : '',
    sleepQuality: day.sleepQuality != null ? String(day.sleepQuality) : '',
    notes: day.comments ?? '',
    weight: day.weight != null ? String(day.weight) : '',
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

    return {
      id: String(r.id ?? ''),
      date,
      readiness: typeof r.readiness === 'number' ? r.readiness : null,
      sleepHours: typeof r.sleepHours === 'number' ? r.sleepHours : null,
      sleepQuality: typeof r.sleepQuality === 'number' ? r.sleepQuality : null,
      comments: typeof r.comments === 'string' ? r.comments : null,
      weight: typeof r.weight === 'number' ? r.weight : null,
    };
  }

  return null;
}
