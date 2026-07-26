import { describe, expect, it } from 'vitest';

import {
  formatProviderSubscriptionStatus,
  formatRenewalNotice,
} from '../adapters';

describe('subscription formatting helpers', () => {
  it('formats provider subscription statuses with urgency indicators', () => {
    expect(formatProviderSubscriptionStatus('ACTIVE')).toEqual({
      label: 'Active',
      isUrgent: false,
      colorClass: 'text-emerald-400',
    });

    expect(formatProviderSubscriptionStatus('PAST_DUE')).toEqual({
      label: 'Past Due — Action Required',
      isUrgent: true,
      colorClass: 'text-red-400 font-semibold',
    });

    expect(formatProviderSubscriptionStatus('BILLING_RETRY')).toEqual({
      label: 'Billing Retry — Action Required',
      isUrgent: true,
      colorClass: 'text-amber-400 font-semibold',
    });

    expect(formatProviderSubscriptionStatus('GRACE_PERIOD')).toEqual({
      label: 'Grace Period — Update Payment Method',
      isUrgent: true,
      colorClass: 'text-amber-400 font-semibold',
    });

    expect(formatProviderSubscriptionStatus('CANCELED')).toEqual({
      label: 'Canceled',
      isUrgent: false,
      colorClass: 'text-text-muted',
    });
  });

  it('formats renewal notice correctly based on autoRenew and entitlementEnd', () => {
    expect(formatRenewalNotice(null, null)).toBeNull();
    const date = '2026-08-15T00:00:00.000Z';
    const formattedDate = new Date(date).toLocaleDateString();

    expect(formatRenewalNotice(true, date)).toBe(`Renews automatically on ${formattedDate}`);
    expect(formatRenewalNotice(false, date)).toBe(
      `Cancels automatically on ${formattedDate} (Access through ${formattedDate})`,
    );
    expect(formatRenewalNotice(null, date)).toBe(`Access through ${formattedDate}`);
  });
});
