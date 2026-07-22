import { mapRecommendationDrivers } from './mapRecommendationDrivers';
import type {
  ActivityRecommendationApi,
  RecoverySentiment,
  RecommendationDetailViewModel,
  TodayRecoveryStrip,
  TodayViewModel,
} from './types';

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

function pickCtxValue(
  ctx: Record<string, unknown> | null | undefined,
  keys: string[]
): unknown {
  if (!ctx) return null;
  for (const key of keys) {
    const value = ctx[key];
    if (value != null && value !== '') return value;
  }
  return null;
}

function labelFromValue(value: unknown): string | null {
  if (value == null) return null;
  if (typeof value === 'number' || typeof value === 'string') {
    const s = String(value).trim();
    return s || null;
  }
  return null;
}

/**
 * Map a free-text recovery status label to good/ok/poor when it encodes sentiment.
 * Returns null when the label is only a raw number or unrecognized wording.
 */
export function recoverySentimentFromLabel(
  label: string | null | undefined
): RecoverySentiment | null {
  if (label == null) return null;
  const s = label.toLowerCase().trim();
  if (!s) return null;

  if (
    /\b(poor|bad|low|weak|deficient|under-?recovered|compromised|elevated)\b/.test(s) ||
    s === 'red' ||
    s.includes('fatigue high') ||
    s.includes('high fatigue')
  ) {
    return 'poor';
  }
  if (
    /\b(excellent|great|good|optimal|strong|fresh|recovered|solid)\b/.test(s) ||
    s === 'green' ||
    s === 'high'
  ) {
    return 'good';
  }
  if (
    /\b(ok|okay|fair|moderate|average|normal|adequate|amber|yellow)\b/.test(s) ||
    s === 'yellow' ||
    s === 'amber'
  ) {
    return 'ok';
  }
  return null;
}

/**
 * Bucket a numeric recovery metric. Values above 10 use a 0–100 scale;
 * otherwise a 0–10 scale (readiness / feel).
 */
export function recoverySentimentFromNumber(
  value: number | null | undefined
): RecoverySentiment | null {
  if (value == null || Number.isNaN(value)) return null;
  if (value > 10) {
    if (value >= 75) return 'good';
    if (value >= 50) return 'ok';
    return 'poor';
  }
  if (value >= 7) return 'good';
  if (value >= 5) return 'ok';
  return 'poor';
}

/** Derive sentiment from a label, numeric string, or number. */
export function recoverySentimentFromValue(value: unknown): RecoverySentiment | null {
  if (value == null || value === '') return null;
  if (typeof value === 'number') return recoverySentimentFromNumber(value);
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return null;
    if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
      return recoverySentimentFromNumber(Number(trimmed));
    }
    return recoverySentimentFromLabel(trimmed);
  }
  return null;
}

/**
 * Fatigue wording is inverted vs readiness: high/elevated → poor, low/minimal → good.
 */
export function fatigueSentimentFromLabel(
  label: string | null | undefined
): RecoverySentiment | null {
  if (label == null) return null;
  const s = label.toLowerCase().trim();
  if (!s) return null;
  if (/\b(high|elevated|severe|heavy|significant)\b/.test(s)) return 'poor';
  if (/\b(low|minimal|none|light)\b/.test(s)) return 'good';
  if (/\b(moderate|medium|mild|ok|okay|fair)\b/.test(s)) return 'ok';
  return recoverySentimentFromLabel(s);
}

function mapRecoveryStrip(
  analysis: ActivityRecommendationApi['analysisJson']
): TodayRecoveryStrip {
  const ctx = analysis?.recovery_context ?? null;
  const ra = analysis?.recovery_analysis ?? null;

  const sleepRaw =
    pickCtxValue(ctx, ['sleep', 'sleepScore', 'sleep_hours', 'sleepQuality', 'sleep_quality']) ??
    ra?.sleep_quality ??
    null;
  const hrvRaw =
    pickCtxValue(ctx, ['hrv', 'hrvStatus', 'hrv_delta', 'hrv_status']) ?? ra?.hrv_status ?? null;
  const feelRaw =
    pickCtxValue(ctx, ['feel', 'readiness', 'subjective', 'readiness_score']) ??
    (ra?.readiness_score != null ? ra.readiness_score : null) ??
    ra?.fatigue_level ??
    null;

  const sleepLabel = labelFromValue(sleepRaw);
  const hrvLabel = labelFromValue(hrvRaw);
  const feelLabel = labelFromValue(feelRaw);

  const sleepSentiment =
    recoverySentimentFromValue(
      pickCtxValue(ctx, ['sleepRating', 'sleep_status', 'sleepStatus', 'sleep_quality'])
    ) ?? recoverySentimentFromValue(sleepRaw);

  const hrvSentiment =
    recoverySentimentFromValue(
      pickCtxValue(ctx, ['hrvRating', 'hrv_status', 'hrvStatus'])
    ) ?? recoverySentimentFromValue(hrvRaw);

  const feelFromCtx = recoverySentimentFromValue(
    pickCtxValue(ctx, ['feelRating', 'feel_status', 'readiness', 'feel'])
  );
  const feelFromScore =
    ra?.readiness_score != null ? recoverySentimentFromNumber(ra.readiness_score) : null;
  const feelFromFatigue =
    feelLabel && ra?.fatigue_level && feelLabel === String(ra.fatigue_level)
      ? fatigueSentimentFromLabel(ra.fatigue_level)
      : null;
  const feelSentiment =
    feelFromCtx ?? feelFromScore ?? feelFromFatigue ?? recoverySentimentFromValue(feelRaw);

  return {
    sleepLabel,
    hrvLabel,
    feelLabel,
    sleepSentiment,
    hrvSentiment,
    feelSentiment,
  };
}

const EMPTY_RECOVERY: TodayRecoveryStrip = {
  sleepLabel: null,
  hrvLabel: null,
  feelLabel: null,
  sleepSentiment: null,
  hrvSentiment: null,
  feelSentiment: null,
};

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
      recovery: { ...EMPTY_RECOVERY },
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
    recovery: mapRecoveryStrip(raw.analysisJson),
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

function asFiniteNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() && Number.isFinite(Number(value))) {
    return Number(value);
  }
  return null;
}

/**
 * Map today’s recommendation payload into the View Details sheet model.
 * Prefers `analysisJson` originals/mods; falls back to linked planned workout for Original Plan.
 */
export function mapRecommendationDetail(
  raw: ActivityRecommendationApi | null | undefined
): RecommendationDetailViewModel | null {
  if (!raw?.id) return null;

  const mods = raw.analysisJson?.suggested_modifications ?? null;
  const analysisPlan = raw.analysisJson?.planned_workout ?? null;
  const linked = raw.plannedWorkout ?? null;
  const unit = normalizeConfidence(typeof raw.confidence === 'number' ? raw.confidence : null);

  const keyFactors = Array.isArray(raw.analysisJson?.key_factors)
    ? raw.analysisJson!.key_factors!.filter((f): f is string => typeof f === 'string' && f.trim().length > 0)
    : [];
  const recoveryAnalysis = raw.analysisJson?.recovery_analysis ?? null;
  const drivers = mapRecommendationDrivers({
    recoveryAnalysis,
    keyFactors,
  });

  let originalPlan: RecommendationDetailViewModel['originalPlan'] = null;
  if (analysisPlan && (analysisPlan.original_title || analysisPlan.original_duration_min != null)) {
    originalPlan = {
      title: analysisPlan.original_title?.trim() || 'Original plan',
      durationMin: asFiniteNumber(analysisPlan.original_duration_min),
      tss: asFiniteNumber(analysisPlan.original_tss),
    };
  } else if (linked) {
    originalPlan = {
      title: linked.title?.trim() || 'Planned workout',
      durationMin:
        linked.durationSec != null && linked.durationSec > 0
          ? Math.round(linked.durationSec / 60)
          : null,
      tss: asFiniteNumber(linked.tss),
    };
  }

  const suggestedChanges = mods
    ? {
        title: mods.new_title?.trim() || null,
        durationMin: asFiniteNumber(mods.new_duration_min),
        tss: asFiniteNumber(mods.new_tss),
        description: mods.description?.trim() || null,
      }
    : null;

  return {
    recommendationId: raw.id,
    action: raw.recommendation ?? null,
    actionLabel: actionLabel(raw.recommendation),
    reasoning: raw.reasoning?.trim() || mods?.description?.trim() || null,
    confidence: unit,
    confidencePercent: unit == null ? null : Math.round(unit * 100),
    userAccepted: Boolean(raw.userAccepted),
    canAccept: Boolean(mods) && !raw.userAccepted,
    keyFactors,
    recoveryAnalysis,
    drivers,
    originalPlan,
    suggestedChanges,
  };
}
