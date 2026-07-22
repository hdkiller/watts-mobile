import { describe, expect, it } from 'vitest';

import {
  canonicalSubscriptionTier,
  classifyProductTier,
  identityForSession,
  packagePeriod,
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
    expect(identityForSession({ authenticated: true, hostedAcquisitionEnabled: true, userId: 'user-1' })).toBe('user-1');
    expect(identityForSession({ authenticated: false, hostedAcquisitionEnabled: true, userId: 'user-1' })).toBeNull();
    expect(identityForSession({ authenticated: true, hostedAcquisitionEnabled: false, userId: 'user-1' })).toBeNull();
  });

  it('maps only configured products and supported recurrence packages', () => {
    expect(classifyProductTier('support.month', ['support.month'], ['pro.month'])).toBe('SUPPORTER');
    expect(classifyProductTier('pro.month', ['support.month'], ['pro.month'])).toBe('PRO');
    expect(classifyProductTier('unknown', ['support.month'], ['pro.month'])).toBeNull();
    expect(packagePeriod('$rc_monthly', 'MONTHLY')).toBe('MONTHLY');
    expect(packagePeriod('$rc_annual', 'ANNUAL')).toBe('ANNUAL');
  });

  it('uses the canonical server summary even when client state differs', () => {
    expect(canonicalSubscriptionTier({
      tier: 'SUPPORTER',
      hasCollision: false,
      acquisitionSuppressed: true,
      subscriptions: [],
    })).toBe('SUPPORTER');
  });
});
