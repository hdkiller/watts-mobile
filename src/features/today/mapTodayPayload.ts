import type { ActivityRecommendationApi, TodayViewModel } from './types';

/** Visual category for the Today recommendation hero accent. */
export type HeroTone = 'train' | 'rest' | 'modify';

/** Normalized confidence strength for the three-dot indicator. */
export type ConfidenceBucket = 'low' | 'medium' | 'high';

/**
 * Maps an API recommendation action to a hero accent tone.
 * Known train-like actions and unrecognized values use brand (train).
 */
export function heroToneForAction(action: string | null | undefined): HeroTone {
  switch ((action ?? '').toLowerCase().trim()) {
    case 'rest':
      return 'rest';
    case 'modify':
    case 'reduce_intensity':
      return 'modify';
    case 'proceed':
    case 'train':
      return 'train';
    default:
      return 'train';
  }
}

/** Coerce API confidence (0–1 or 0–100) into a 0–1 unit interval, or null. */
export function normalizeConfidence(confidence: number | null | undefined): number | null {
  if (confidence == null || Number.isNaN(confidence)) return null;
  const unit = confidence <= 1 ? confidence : confidence / 100;
  return Math.min(1, Math.max(0, unit));
}

/** Bucket normalized confidence for the three-dot strength indicator. */
export function confidenceBucket(confidence: number | null | undefined): ConfidenceBucket | null {
  const unit = normalizeConfidence(confidence);
  if (unit == null) return null;
  if (unit < 0.45) return 'low';
  if (unit < 0.75) return 'medium';
  return 'high';
}

/** Filled-dot count (1–3) for the strength indicator; null when confidence absent. */
export function confidenceFilledCount(confidence: number | null | undefined): number | null {
  const bucket = confidenceBucket(confidence);
  if (bucket == null) return null;
  if (bucket === 'low') return 1;
  if (bucket === 'medium') return 2;
  return 3;
}

function actionLabel(action: string | null | undefined): string {
  switch (action) {
    case 'proceed':
      return 'Proceed as planned';
    case 'modify':
      return 'Modify workout';
    case 'reduce_intensity':
      return 'Reduce intensity';
    case 'rest':
      return 'Rest day';
    default:
      return action ? action.replace(/_/g, ' ') : 'No recommendation yet';
  }
}

function structureSummary(structure: unknown): string | null {
  if (!structure || typeof structure !== 'object') return null;
  const steps = (structure as { steps?: unknown[] }).steps;
  if (Array.isArray(steps) && steps.length > 0) {
    return `${steps.length} structured step${steps.length === 1 ? '' : 's'}`;
  }
  const intervals = (structure as { intervals?: unknown[] }).intervals;
  if (Array.isArray(intervals) && intervals.length > 0) {
    return `${intervals.length} interval${intervals.length === 1 ? '' : 's'}`;
  }
  return null;
}

function pickRecoveryLabel(
  analysis: ActivityRecommendationApi['analysisJson'],
  keys: string[]
): string | null {
  const ctx = analysis?.recovery_context;
  if (!ctx || typeof ctx !== 'object') return null;
  for (const key of keys) {
    const value = (ctx as Record<string, unknown>)[key];
    if (value == null) continue;
    if (typeof value === 'number' || typeof value === 'string') return String(value);
  }
  return null;
}

export function mapTodayPayload(raw: ActivityRecommendationApi | null): TodayViewModel {
  if (!raw) {
    return {
      recommendationId: null,
      action: null,
      actionLabel: 'No recommendation yet',
      rationale: null,
      confidence: null,
      status: null,
      userAccepted: false,
      canAccept: false,
      modificationSummary: null,
      plannedWorkout: null,
      recovery: { sleepLabel: null, hrvLabel: null, feelLabel: null },
      raw: null,
    };
  }

  const mods = raw.analysisJson?.suggested_modifications ?? null;
  const planned = raw.plannedWorkout ?? null;

  return {
    recommendationId: raw.id,
    action: raw.recommendation ?? null,
    actionLabel: actionLabel(raw.recommendation),
    rationale: raw.reasoning ?? mods?.description ?? null,
    confidence: typeof raw.confidence === 'number' ? raw.confidence : null,
    status: raw.status ?? null,
    userAccepted: Boolean(raw.userAccepted),
    canAccept: Boolean(mods) && !raw.userAccepted,
    modificationSummary: mods?.description ?? null,
    plannedWorkout: planned
      ? {
          id: planned.id,
          title: planned.title || 'Planned workout',
          type: planned.type ?? null,
          date: planned.date ? String(planned.date) : null,
          durationSec: planned.durationSec ?? null,
          tss: planned.tss ?? null,
          description: planned.description ?? null,
          structureSummary: structureSummary(planned.structure),
        }
      : null,
    recovery: {
      sleepLabel: pickRecoveryLabel(raw.analysisJson, ['sleep', 'sleepScore', 'sleep_hours']),
      hrvLabel: pickRecoveryLabel(raw.analysisJson, ['hrv', 'hrvStatus', 'hrv_delta']),
      feelLabel: pickRecoveryLabel(raw.analysisJson, ['feel', 'readiness', 'subjective']),
    },
    raw,
  };
}

export function formatDuration(durationSec: number | null): string | null {
  if (durationSec == null || durationSec <= 0) return null;
  const minutes = Math.round(durationSec / 60);
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}
