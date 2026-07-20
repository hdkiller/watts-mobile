import type { AdHocWorkoutRequest } from './adHocApi';

/** Pure validation shared with CreateAdHocWorkoutSheet submit rules. */
export function validateAdHocForm(input: {
  type: AdHocWorkoutRequest['type'];
  durationText: string;
  intensity: AdHocWorkoutRequest['intensity'];
  notes: string;
}): { ok: true; payload: AdHocWorkoutRequest } | { ok: false; error: string } {
  const durationMinutes = Number(input.durationText);
  if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) {
    return { ok: false, error: 'Enter a duration greater than zero.' };
  }
  return {
    ok: true,
    payload: {
      type: input.type,
      durationMinutes: Math.round(durationMinutes),
      intensity: input.intensity,
      notes: input.notes.trim(),
    },
  };
}
