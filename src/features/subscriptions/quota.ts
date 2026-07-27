import { ApiError } from '@/src/api/errors';

import type { SubscriptionTier } from './types';

/**
 * Metered capabilities the server can exhaust. Keep in sync with the API's
 * `feature` values; unknown strings degrade to `UNKNOWN` rather than throwing.
 */
export type QuotaFeature =
  | 'READINESS_RECOMMENDATION'
  | 'WORKOUT_GENERATION'
  | 'ACTIVITY_ANALYSIS'
  | 'MEAL_RECOMMENDATION'
  | 'DAILY_CHECKIN'
  | 'ATHLETE_REPORT'
  | 'COACH_CHAT'
  | 'UNKNOWN';

export type QuotaInfo = {
  feature: QuotaFeature;
  /** Allowance for the current window, when the server reports it. */
  limit?: number;
  used?: number;
  /** ISO timestamp when the allowance refills. */
  resetAt?: string | null;
  retryAfterSeconds?: number;
  /** Lowest tier that lifts this limit. */
  requiredTier?: Exclude<SubscriptionTier, 'FREE'>;
  /** Raw server copy, kept for diagnostics — not shown verbatim. */
  serverMessage?: string;
};

const FEATURE_VALUES: readonly QuotaFeature[] = [
  'READINESS_RECOMMENDATION',
  'WORKOUT_GENERATION',
  'ACTIVITY_ANALYSIS',
  'MEAL_RECOMMENDATION',
  'DAILY_CHECKIN',
  'ATHLETE_REPORT',
  'COACH_CHAT',
];

type FeatureCopy = {
  /** Headline noun ("Workout analysis limit reached"). */
  title: string;
  /** Countable unit for the usage line ("workout analyses"). */
  unit: string;
  /** What a paid plan changes for this capability. */
  upsell: string;
};

const FEATURE_COPY: Record<QuotaFeature, FeatureCopy> = {
  READINESS_RECOMMENDATION: {
    title: 'Daily recommendation limit reached',
    unit: 'daily recommendations',
    upsell: 'Pro gives you a fresh readiness call every day, plus priority processing.',
  },
  WORKOUT_GENERATION: {
    title: 'Workout generation limit reached',
    unit: 'generated workouts',
    upsell: 'Pro generates unlimited ad-hoc sessions and adapts them to your week.',
  },
  ACTIVITY_ANALYSIS: {
    title: 'Workout analysis limit reached',
    unit: 'workout analyses',
    upsell: 'Pro analyses every session you log, with scores and coaching takeaways.',
  },
  MEAL_RECOMMENDATION: {
    title: 'Meal suggestion limit reached',
    unit: 'meal suggestions',
    upsell: 'Supporter unlocks meal suggestions for every fuelling window.',
  },
  DAILY_CHECKIN: {
    title: 'Daily check-in limit reached',
    unit: 'check-ins',
    upsell: 'Supporter keeps daily check-ins and recovery guidance always on.',
  },
  ATHLETE_REPORT: {
    title: 'Athlete report limit reached',
    unit: 'athlete reports',
    upsell: 'Pro regenerates your athlete profile whenever your training changes.',
  },
  COACH_CHAT: {
    title: 'Coach chat limit reached',
    unit: 'coach messages',
    upsell: 'Pro includes unlimited Coach AI chat and workout discussion.',
  },
  UNKNOWN: {
    title: 'Plan limit reached',
    unit: 'requests',
    upsell: 'Upgrading raises the limits on AI coaching features.',
  },
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : null;
}

function readNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '' && Number.isFinite(Number(value))) {
    return Number(value);
  }
  return undefined;
}

function normalizeFeature(value: unknown): QuotaFeature | undefined {
  if (typeof value !== 'string') return undefined;
  const upper = value.trim().toUpperCase().replaceAll('-', '_');
  return FEATURE_VALUES.find((feature) => feature === upper);
}

function normalizeTier(value: unknown): Exclude<SubscriptionTier, 'FREE'> | undefined {
  if (typeof value !== 'string') return undefined;
  const upper = value.trim().toUpperCase();
  return upper === 'PRO' || upper === 'SUPPORTER' ? upper : undefined;
}

function httpStatus(err: unknown): number | undefined {
  if (err instanceof ApiError) return err.status;
  const record = asRecord(err);
  return record ? readNumber(record.status) : undefined;
}

function errorBody(err: unknown): Record<string, unknown> | null {
  if (err instanceof ApiError) {
    const body = asRecord(err.body);
    if (!body) return null;
    // Servers wrap the payload inconsistently across these endpoints.
    return asRecord(body.error) ?? asRecord(body.quota) ?? body;
  }
  const record = asRecord(err);
  return record ? (asRecord(record.body) ?? null) : null;
}

/** Last-resort detection for endpoints that still return prose instead of a code. */
function looksLikeQuotaMessage(message: string): boolean {
  const text = message.toLowerCase();
  return text.includes('quota') || text.includes('limit reached') || text.includes('rate limit');
}

/**
 * Single detector for every metered endpoint. Prefers the structured 429 body
 * (`code`/`feature`/`limit`/`used`/`resetAt`) and falls back to status + prose
 * so older endpoints keep working.
 */
export function parseQuotaError(err: unknown, fallbackFeature: QuotaFeature): QuotaInfo | null {
  const status = httpStatus(err);
  const message = err instanceof Error ? err.message : '';
  const body = errorBody(err);
  const code = typeof body?.code === 'string' ? body.code.toUpperCase() : undefined;

  const isQuota =
    status === 429 ||
    code === 'QUOTA_EXCEEDED' ||
    code === 'PLAN_LIMIT_REACHED' ||
    (message !== '' && looksLikeQuotaMessage(message));
  if (!isQuota) return null;

  const resetRaw = body?.resetAt ?? body?.resetsAt ?? body?.retryAt;
  return {
    feature: normalizeFeature(body?.feature) ?? fallbackFeature,
    limit: readNumber(body?.limit),
    used: readNumber(body?.used),
    resetAt: typeof resetRaw === 'string' ? resetRaw : null,
    retryAfterSeconds: readNumber(body?.retryAfterSeconds ?? body?.retryAfter),
    requiredTier: normalizeTier(body?.requiredTier),
    serverMessage: message || undefined,
  };
}

/**
 * Fold the transport's `Retry-After` (seconds or HTTP date) into the error body
 * so {@link parseQuotaError} can tell the athlete when the allowance returns.
 */
export function withRetryAfter(response: Response, body: unknown): unknown {
  const header = response.headers.get('Retry-After');
  if (!header) return body;

  const asSeconds = Number(header);
  const seconds = Number.isFinite(asSeconds)
    ? asSeconds
    : (() => {
        const date = new Date(header).getTime();
        return Number.isNaN(date) ? NaN : Math.max(0, Math.round((date - Date.now()) / 1000));
      })();
  if (!Number.isFinite(seconds)) return body;

  const base = asRecord(body) ?? {};
  return { ...base, retryAfterSeconds: seconds };
}

export function quotaHeadline(info: QuotaInfo): string {
  return FEATURE_COPY[info.feature].title;
}

/** "All 3 workout analyses on your plan are used." — omitted without real numbers. */
export function quotaUsageLine(info: QuotaInfo): string | null {
  const { limit, used, feature } = info;
  const unit = FEATURE_COPY[feature].unit;
  if (limit === undefined) return null;
  if (used !== undefined && used < limit) {
    return `You've used ${used} of ${limit} ${unit} on your plan.`;
  }
  return `All ${limit} ${unit} on your plan are used.`;
}

function formatDuration(seconds: number): string {
  if (seconds < 90) return 'in under a minute';
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `in about ${minutes} minutes`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `in about ${hours} hour${hours === 1 ? '' : 's'}`;
  const days = Math.round(hours / 24);
  return `in about ${days} day${days === 1 ? '' : 's'}`;
}

/** "Resets Monday, Mar 4" / "Resets in about 2 hours" — never a bare "try later". */
export function quotaResetLine(info: QuotaInfo, now: Date = new Date()): string | null {
  if (info.resetAt) {
    const reset = new Date(info.resetAt);
    if (!Number.isNaN(reset.getTime())) {
      const deltaMs = reset.getTime() - now.getTime();
      if (deltaMs <= 0) return 'Resets shortly';
      if (deltaMs < 24 * 60 * 60 * 1000) {
        return `Resets ${formatDuration(deltaMs / 1000)} (${reset.toLocaleTimeString(undefined, {
          hour: 'numeric',
          minute: '2-digit',
        })})`;
      }
      return `Resets ${reset.toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
      })}`;
    }
  }
  if (info.retryAfterSeconds !== undefined && info.retryAfterSeconds > 0) {
    return `Resets ${formatDuration(info.retryAfterSeconds)}`;
  }
  return null;
}

export function quotaUpsellLine(info: QuotaInfo): string {
  if (info.requiredTier === 'SUPPORTER') {
    return FEATURE_COPY[info.feature].upsell.replace(/^Pro\b/, 'Supporter');
  }
  return FEATURE_COPY[info.feature].upsell;
}

/** Contextual paywall header for the feature the athlete was blocked on. */
export function quotaPaywallHeadline(feature: QuotaFeature): string {
  switch (feature) {
    case 'ACTIVITY_ANALYSIS':
      return 'Unlock unlimited workout analysis';
    case 'WORKOUT_GENERATION':
      return 'Unlock unlimited workout generation';
    case 'READINESS_RECOMMENDATION':
      return 'Unlock daily readiness coaching';
    case 'MEAL_RECOMMENDATION':
      return 'Unlock meal suggestions';
    case 'DAILY_CHECKIN':
      return 'Unlock daily check-ins';
    case 'ATHLETE_REPORT':
      return 'Unlock athlete reports';
    case 'COACH_CHAT':
      return 'Unlock unlimited Coach AI chat';
    default:
      return 'Unlock the full Coach Watts';
  }
}

export function isQuotaFeature(value: string | undefined): value is QuotaFeature {
  return normalizeFeature(value) !== undefined;
}

export function parseQuotaFeature(value: string | undefined): QuotaFeature {
  return normalizeFeature(value) ?? 'UNKNOWN';
}
