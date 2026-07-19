import type { ActivityRecommendationApi, TodayViewModel } from './types';

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
