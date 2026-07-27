import { describe, expect, it } from 'vitest';

import { ApiError } from '@/src/api/errors';

import {
  parseQuotaError,
  quotaResetLine,
  quotaUpsellLine,
  quotaUsageLine,
  withRetryAfter,
} from '../quota';

describe('parseQuotaError', () => {
  it('reads the structured 429 body', () => {
    const err = new ApiError('Quota exceeded', 429, {
      code: 'QUOTA_EXCEEDED',
      feature: 'ACTIVITY_ANALYSIS',
      limit: 3,
      used: 3,
      resetAt: '2026-08-01T00:00:00.000Z',
      requiredTier: 'pro',
    });
    expect(parseQuotaError(err, 'COACH_CHAT')).toEqual({
      feature: 'ACTIVITY_ANALYSIS',
      limit: 3,
      used: 3,
      resetAt: '2026-08-01T00:00:00.000Z',
      retryAfterSeconds: undefined,
      requiredTier: 'PRO',
      serverMessage: 'Quota exceeded',
    });
  });

  it('unwraps nested error envelopes', () => {
    const err = new ApiError('nope', 429, { error: { feature: 'coach_chat', limit: 20 } });
    const info = parseQuotaError(err, 'UNKNOWN');
    expect(info?.feature).toBe('COACH_CHAT');
    expect(info?.limit).toBe(20);
  });

  it('falls back to the caller’s feature on a bare 429', () => {
    expect(parseQuotaError(new ApiError('too many', 429), 'DAILY_CHECKIN')?.feature).toBe(
      'DAILY_CHECKIN',
    );
  });

  it('still catches endpoints that only return prose', () => {
    expect(
      parseQuotaError(new Error('Quota exceeded for workout generation.'), 'WORKOUT_GENERATION'),
    ).not.toBeNull();
    expect(
      parseQuotaError(new Error('Meal recommendation limit reached'), 'MEAL_RECOMMENDATION'),
    ).not.toBeNull();
  });

  it('ignores unrelated failures', () => {
    expect(parseQuotaError(new ApiError('Server error', 500), 'COACH_CHAT')).toBeNull();
    expect(parseQuotaError(new Error('Network request failed'), 'COACH_CHAT')).toBeNull();
    expect(parseQuotaError(null, 'COACH_CHAT')).toBeNull();
  });

  it('accepts plain objects carrying a status', () => {
    expect(parseQuotaError({ status: 429 }, 'ATHLETE_REPORT')?.feature).toBe('ATHLETE_REPORT');
  });
});

describe('withRetryAfter', () => {
  function responseWith(header: string | null): Response {
    return { headers: { get: () => header } } as unknown as Response;
  }

  it('folds numeric Retry-After seconds into the body', () => {
    expect(withRetryAfter(responseWith('120'), { limit: 3 })).toEqual({
      limit: 3,
      retryAfterSeconds: 120,
    });
  });

  it('converts an HTTP-date Retry-After to seconds', () => {
    const future = new Date(Date.now() + 60_000).toUTCString();
    const result = withRetryAfter(responseWith(future), null) as { retryAfterSeconds: number };
    expect(result.retryAfterSeconds).toBeGreaterThan(50);
    expect(result.retryAfterSeconds).toBeLessThanOrEqual(60);
  });

  it('passes the body through when the header is absent', () => {
    expect(withRetryAfter(responseWith(null), { a: 1 })).toEqual({ a: 1 });
  });
});

describe('quota copy', () => {
  it('states usage only when the server reported real numbers', () => {
    expect(quotaUsageLine({ feature: 'ACTIVITY_ANALYSIS', limit: 3, used: 3 })).toBe(
      'All 3 workout analyses on your plan are used.',
    );
    expect(quotaUsageLine({ feature: 'ACTIVITY_ANALYSIS', limit: 5, used: 2 })).toBe(
      "You've used 2 of 5 workout analyses on your plan.",
    );
    expect(quotaUsageLine({ feature: 'ACTIVITY_ANALYSIS' })).toBeNull();
  });

  it('turns a reset timestamp into a date, never "try again later"', () => {
    const now = new Date('2026-03-01T10:00:00.000Z');
    expect(
      quotaResetLine({ feature: 'COACH_CHAT', resetAt: '2026-03-04T10:00:00.000Z' }, now),
    ).toContain('Resets');
    expect(quotaResetLine({ feature: 'COACH_CHAT', retryAfterSeconds: 7200 }, now)).toBe(
      'Resets in about 2 hours',
    );
    expect(quotaResetLine({ feature: 'COACH_CHAT' }, now)).toBeNull();
  });

  it('names the tier that actually lifts the limit', () => {
    expect(quotaUpsellLine({ feature: 'ACTIVITY_ANALYSIS' })).toContain('Pro');
    expect(quotaUpsellLine({ feature: 'ACTIVITY_ANALYSIS', requiredTier: 'SUPPORTER' })).toContain(
      'Supporter',
    );
  });
});
