import type { LogFormValues } from './types';
import type { HealthPrefill } from './healthPrefillTypes';

/** Apply prefill only into empty fields (never overwrite athlete edits). */
export function applyHealthPrefill(
  form: LogFormValues,
  prefill: HealthPrefill,
  opts?: { weightUnit?: 'kg' | 'lb' }
): LogFormValues {
  const next = { ...form };
  if (!next.sleepHours.trim() && prefill.sleepHours) {
    next.sleepHours = prefill.sleepHours;
  }
  if (!next.weight.trim() && prefill.weightKg) {
    const kg = Number(prefill.weightKg);
    if (Number.isFinite(kg)) {
      if (opts?.weightUnit === 'lb') {
        next.weight = String(Math.round(kg * 2.20462 * 10) / 10);
      } else {
        next.weight = String(kg);
      }
    }
  }
  return next;
}
