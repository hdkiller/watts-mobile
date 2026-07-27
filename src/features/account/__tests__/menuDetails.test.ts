import { describe, expect, it } from 'vitest';

import {
  inviteRowDetail,
  notificationsRowDetail,
  shortDateLabel,
  subscriptionRowDetail,
  subscriptionTierLabel,
} from '../menuDetails';
import type { SubscriptionSummary } from '@/src/features/subscriptions/types';

function summary(partial: Partial<SubscriptionSummary> = {}): SubscriptionSummary {
  return {
    tier: 'FREE',
    hasCollision: false,
    acquisitionSuppressed: false,
    subscriptions: [],
    ...partial,
  };
}

function entitlement(partial: Partial<SubscriptionSummary['subscriptions'][number]> = {}) {
  return {
    provider: 'APPLE' as const,
    productId: 'cw_pro_monthly',
    tier: 'PRO' as const,
    status: 'ACTIVE' as const,
    entitlementEnd: '2026-08-12T10:00:00.000Z',
    autoRenew: true,
    managementUrl: null,
    ...partial,
  };
}

describe('shortDateLabel', () => {
  it('formats an ISO date as day + short month', () => {
    expect(shortDateLabel('2026-08-12T10:00:00.000Z')).toBe('12 Aug');
  });

  it('returns null for missing or unparseable input', () => {
    expect(shortDateLabel(null)).toBeNull();
    expect(shortDateLabel(undefined)).toBeNull();
    expect(shortDateLabel('not-a-date')).toBeNull();
  });
});

describe('subscriptionTierLabel', () => {
  it('maps API tiers to display names', () => {
    expect(subscriptionTierLabel('PRO')).toBe('Pro');
    expect(subscriptionTierLabel('SUPPORTER')).toBe('Supporter');
    expect(subscriptionTierLabel('FREE')).toBe('Free');
  });
});

describe('subscriptionRowDetail', () => {
  it('falls back to a descriptive subtitle before the summary loads', () => {
    expect(subscriptionRowDetail(undefined)).toBe('Plan, billing & restore purchases');
    expect(subscriptionRowDetail(undefined, { isLoading: true })).toBe('Checking…');
    expect(subscriptionRowDetail(undefined, { isError: true })).toBe('Status unavailable');
  });

  it('invites free athletes to look at the paid tiers', () => {
    expect(subscriptionRowDetail(summary())).toBe('Free plan · see what Supporter unlocks');
  });

  it('shows the renewal date for an auto-renewing plan', () => {
    expect(subscriptionRowDetail(summary({ tier: 'PRO', subscriptions: [entitlement()] }))).toBe(
      'Pro · renews 12 Aug',
    );
  });

  it('shows the end date when auto-renew is off', () => {
    expect(
      subscriptionRowDetail(
        summary({
          tier: 'SUPPORTER',
          subscriptions: [entitlement({ tier: 'SUPPORTER', autoRenew: false })],
        }),
      ),
    ).toBe('Supporter · ends 12 Aug');
  });

  it('flags billing problems ahead of the date', () => {
    expect(
      subscriptionRowDetail(
        summary({ tier: 'PRO', subscriptions: [entitlement({ status: 'PAST_DUE' })] }),
      ),
    ).toBe('Pro · action required');
  });

  it('flags a collision over any per-entitlement detail', () => {
    expect(
      subscriptionRowDetail(
        summary({ tier: 'PRO', hasCollision: true, subscriptions: [entitlement()] }),
      ),
    ).toBe('Pro · multiple active subscriptions');
  });

  it('drops the date line when the entitlement has no end', () => {
    expect(
      subscriptionRowDetail(
        summary({ tier: 'PRO', subscriptions: [entitlement({ entitlementEnd: null })] }),
      ),
    ).toBe('Pro');
  });
});

describe('inviteRowDetail', () => {
  it('promises the outcome before anyone has joined', () => {
    expect(inviteRowDetail(0)).toBe('Share your code — they’ll be set up in minutes');
    expect(inviteRowDetail(undefined)).toBe('Share your code — they’ll be set up in minutes');
  });

  it('shows attribution count as social proof', () => {
    expect(inviteRowDetail(1)).toBe('1 friend joined so far');
    expect(inviteRowDetail(4)).toBe('4 friends joined so far');
  });
});

describe('notificationsRowDetail', () => {
  it('summarises unread state', () => {
    expect(notificationsRowDetail(0)).toBe('All caught up');
    expect(notificationsRowDetail(1)).toBe('1 unread');
    expect(notificationsRowDetail(7)).toBe('7 unread');
  });
});
