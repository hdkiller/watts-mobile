import { describe, expect, it } from 'vitest';

import {
  canonicalSubscriptionTier,
  canShowPlanChooser,
  classifyProductTier,
  identityForSession,
  packagePeriod,
  summaryQueryState,
} from '../adapters';
import { isOfficialHostedInstance } from '../gating';

describe('subscription adapters', () => {
  it('allows only the exact HTTPS hosted instance', () => {
    expect(isOfficialHostedInstance('https://coachwatts.com')).toBe(true);
    expect(isOfficialHostedInstance('http://coachwatts.com')).toBe(false);
    expect(isOfficialHostedInstance('https://billing.coachwatts.com')).toBe(false);
    expect(isOfficialHostedInstance('http://localhost:3099')).toBe(false);
  });

  it('detaches RevenueCat identity for logout, account transition, or self-hosted use', () => {
    expect(
      identityForSession({ authenticated: true, hostedAcquisitionEnabled: true, userId: 'user-1' }),
    ).toBe('user-1');
    expect(
      identityForSession({
        authenticated: false,
        hostedAcquisitionEnabled: true,
        userId: 'user-1',
      }),
    ).toBeNull();
    expect(
      identityForSession({
        authenticated: true,
        hostedAcquisitionEnabled: false,
        userId: 'user-1',
      }),
    ).toBeNull();
  });

  it('maps only configured products and supported recurrence packages', () => {
    expect(classifyProductTier('support.month', ['support.month'], ['pro.month'])).toBe(
      'SUPPORTER',
    );
    expect(classifyProductTier('pro.month', ['support.month'], ['pro.month'])).toBe('PRO');
    expect(classifyProductTier('unknown', ['support.month'], ['pro.month'])).toBeNull();
    expect(packagePeriod('$rc_monthly', 'MONTHLY')).toBe('MONTHLY');
    expect(packagePeriod('$rc_annual', 'ANNUAL')).toBe('ANNUAL');
  });

  it('uses the canonical server summary even when client state differs', () => {
    expect(
      canonicalSubscriptionTier({
        tier: 'SUPPORTER',
        hasCollision: false,
        acquisitionSuppressed: true,
        subscriptions: [],
      }),
    ).toBe('SUPPORTER');
  });

  it('classifies the subscription-summary query as pending until it settles one way or the other', () => {
    expect(summaryQueryState({ isSuccess: false, isError: false })).toBe('pending');
    expect(summaryQueryState({ isSuccess: true, isError: false })).toBe('ready');
    expect(summaryQueryState({ isSuccess: false, isError: true })).toBe('error');
  });

  it('never shows the plan chooser (and its purchase CTAs) before the summary has settled', () => {
    // Still loading (or refetching with no prior data): fail closed even if
    // acquisition would otherwise be allowed.
    expect(
      canShowPlanChooser({
        summaryState: 'pending',
        acquisitionEnabled: true,
        acquisitionSuppressed: false,
      }),
    ).toBe(false);

    // Errored: fail closed too — we can't tell if a web subscription is active.
    expect(
      canShowPlanChooser({
        summaryState: 'error',
        acquisitionEnabled: true,
        acquisitionSuppressed: false,
      }),
    ).toBe(false);

    // Settled and eligible: show plans.
    expect(
      canShowPlanChooser({
        summaryState: 'ready',
        acquisitionEnabled: true,
        acquisitionSuppressed: false,
      }),
    ).toBe(true);

    // Settled but the server says billing happens elsewhere: still hidden.
    expect(
      canShowPlanChooser({
        summaryState: 'ready',
        acquisitionEnabled: true,
        acquisitionSuppressed: true,
      }),
    ).toBe(false);

    // Settled but acquisition disabled for this instance: still hidden.
    expect(
      canShowPlanChooser({
        summaryState: 'ready',
        acquisitionEnabled: false,
        acquisitionSuppressed: false,
      }),
    ).toBe(false);
  });
});
