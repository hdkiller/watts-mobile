import { apiFetch } from '@/src/api/client';
import { ApiError } from '@/src/api/errors';

import { parseQuotaFeature, type QuotaFeature } from './quota';
import type { SubscriptionTier } from './types';

export type QuotaAllowance = {
  operation: string;
  feature: QuotaFeature;
  limit: number;
  used: number;
  remaining: number;
  /** Human window from the server ("7 days", "calendar day"). */
  window: string;
  resetsAt: string | null;
  requiredTier: Exclude<SubscriptionTier, 'FREE'> | null;
};

export type QuotaAllowanceSummary = {
  tier: SubscriptionTier;
  effectiveTier: SubscriptionTier;
  allowances: QuotaAllowance[];
};

type RawQuota = {
  operation?: unknown;
  feature?: unknown;
  limit?: unknown;
  used?: unknown;
  remaining?: unknown;
  window?: unknown;
  resetsAt?: unknown;
  nextTier?: unknown;
  enforcement?: unknown;
};

function num(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function tier(value: unknown): Exclude<SubscriptionTier, 'FREE'> | null {
  return value === 'PRO' || value === 'SUPPORTER' ? value : null;
}

function mapQuota(raw: RawQuota): QuotaAllowance | null {
  const limit = num(raw.limit);
  const used = num(raw.used);
  const remaining = num(raw.remaining);
  // Measured-only operations report no meaningful ceiling.
  if (limit === null || used === null || remaining === null || limit <= 0) return null;
  if (typeof raw.operation !== 'string') return null;

  return {
    operation: raw.operation,
    feature: parseQuotaFeature(typeof raw.feature === 'string' ? raw.feature : undefined),
    limit,
    used,
    remaining,
    window: typeof raw.window === 'string' ? raw.window : '',
    resetsAt: typeof raw.resetsAt === 'string' ? raw.resetsAt : null,
    requiredTier: tier(raw.nextTier),
  };
}

/**
 * Current allowances for every metered feature.
 *
 * Lets the app warn before a limit is hit; without it the first sign of a limit
 * is a blocked action after the athlete has already waited for a generation.
 */
export async function fetchQuotaAllowances(): Promise<QuotaAllowanceSummary> {
  const response = await apiFetch('/api/profile/quotas');
  if (!response.ok) {
    throw new ApiError(`Quota request failed (${response.status})`, response.status);
  }

  const body = (await response.json()) as {
    tier?: SubscriptionTier;
    effectiveTier?: SubscriptionTier;
    quotas?: RawQuota[];
  };

  return {
    tier: body.tier ?? 'FREE',
    effectiveTier: body.effectiveTier ?? body.tier ?? 'FREE',
    allowances: (body.quotas ?? []).flatMap((quota) => {
      const mapped = mapQuota(quota);
      return mapped ? [mapped] : [];
    }),
  };
}
