import { describe, expect, it } from 'vitest';

import {
  activeStoreProductIds,
  computeAnnualSavingsPercentage,
  formatIntroOfferDisclosure,
  formatOfferPeriod,
  hasActiveWebSubscription,
  monthlyEquivalentPrice,
  planActionLabel,
  planChangeKind,
  substitutePriceAmount,
} from '../adapters';
import type { StoreIntroOffer, SubscriptionSummary } from '../types';

function summary(overrides: Partial<SubscriptionSummary> = {}): SubscriptionSummary {
  return {
    tier: 'FREE',
    hasCollision: false,
    acquisitionSuppressed: false,
    subscriptions: [],
    ...overrides,
  };
}

describe('price formatting', () => {
  it('keeps the store’s symbol placement and separators', () => {
    expect(substitutePriceAmount('$49.99', 4.1658)).toBe('$4.17');
    expect(substitutePriceAmount('49,99 €', 4.1658)).toBe('4,17 €');
    expect(substitutePriceAmount('£39.99', 3.3325)).toBe('£3.33');
  });

  it('respects zero-decimal currencies and grouping', () => {
    expect(substitutePriceAmount('¥5,800', 483.33)).toBe('¥483');
    expect(substitutePriceAmount('12 000 Ft', 1000)).toBe('1 000 Ft');
  });

  it('returns null when there is no amount to rewrite', () => {
    expect(substitutePriceAmount('Free', 1)).toBeNull();
  });

  it('derives the per-month equivalent from the annual price', () => {
    expect(monthlyEquivalentPrice('$49.99', 49.99)).toBe('$4.17');
    expect(monthlyEquivalentPrice('$49.99', undefined)).toBeUndefined();
  });
});

describe('annual savings', () => {
  it('computes the real saving against the monthly package', () => {
    expect(computeAnnualSavingsPercentage(49.99, 5.99)).toBe(30);
    expect(computeAnnualSavingsPercentage(95.88, 7.99)).toBeUndefined(); // identical rate
  });

  it('never invents a discount without a monthly counterpart', () => {
    expect(computeAnnualSavingsPercentage(49.99, undefined)).toBeUndefined();
    expect(computeAnnualSavingsPercentage(undefined, 5.99)).toBeUndefined();
    expect(computeAnnualSavingsPercentage(0, 5.99)).toBeUndefined();
  });
});

describe('intro offer disclosure', () => {
  const trial: StoreIntroOffer = {
    priceString: 'Free',
    price: 0,
    periodLabel: '7 days',
    cycles: 1,
    type: 'FREE_TRIAL',
  };

  it('states the trial length and the converting price', () => {
    expect(formatIntroOfferDisclosure(trial, '$9.99', 'MONTHLY')).toBe(
      '7 days free, then $9.99 per month. Cancel anytime before the trial ends.',
    );
  });

  it('states the discounted price, its length and the recurring price', () => {
    const intro: StoreIntroOffer = {
      priceString: '$0.99',
      price: 0.99,
      periodLabel: '1 month',
      cycles: 3,
      type: 'INTRODUCTORY',
    };
    expect(formatIntroOfferDisclosure(intro, '$49.99', 'ANNUAL')).toBe(
      '$0.99 for the first 1 month for 3 periods, then $49.99 per year.',
    );
  });

  it('pluralizes store period units', () => {
    expect(formatOfferPeriod('DAY', 7)).toBe('7 days');
    expect(formatOfferPeriod('MONTH', 1)).toBe('1 month');
  });
});

describe('plan change classification', () => {
  const pro = { productId: 'pro.year', tier: 'PRO', period: 'ANNUAL' } as const;
  const supporterMonthly = {
    productId: 'support.month',
    tier: 'SUPPORTER',
    period: 'MONTHLY',
  } as const;
  const supporterAnnual = {
    productId: 'support.year',
    tier: 'SUPPORTER',
    period: 'ANNUAL',
  } as const;

  it('marks only the exact product as current, so periods stay switchable', () => {
    const activeProductIds = ['support.month'];
    expect(
      planChangeKind({ pkg: supporterMonthly, currentTier: 'SUPPORTER', activeProductIds }),
    ).toBe('current');
    expect(
      planChangeKind({ pkg: supporterAnnual, currentTier: 'SUPPORTER', activeProductIds }),
    ).toBe('switch-period');
  });

  it('distinguishes upgrade from downgrade', () => {
    expect(
      planChangeKind({ pkg: pro, currentTier: 'SUPPORTER', activeProductIds: ['support.month'] }),
    ).toBe('upgrade');
    expect(
      planChangeKind({
        pkg: supporterMonthly,
        currentTier: 'PRO',
        activeProductIds: ['pro.year'],
      }),
    ).toBe('downgrade');
  });

  it('treats a first store purchase as new even when a web plan is active', () => {
    expect(planChangeKind({ pkg: pro, currentTier: 'SUPPORTER', activeProductIds: [] })).toBe(
      'new',
    );
  });

  it('labels each transition for the button', () => {
    expect(planActionLabel('current', { ...pro, price: '$49.99' })).toBe('Current plan');
    expect(planActionLabel('upgrade', { ...pro, price: '$49.99' })).toBe('Upgrade to Pro · $49.99');
    expect(planActionLabel('switch-period', { ...supporterAnnual, price: '$29.99' })).toBe(
      'Switch to annual · $29.99',
    );
    expect(planActionLabel('new', { ...supporterMonthly, price: '$2.99' })).toBe(
      'Subscribe · $2.99',
    );
  });
});

describe('provider detection', () => {
  it('lists store products the athlete still holds', () => {
    const data = summary({
      tier: 'PRO',
      subscriptions: [
        {
          provider: 'APPLE',
          productId: 'pro.year',
          tier: 'PRO',
          status: 'CANCELED',
          entitlementEnd: null,
          autoRenew: false,
          managementUrl: null,
        },
        {
          provider: 'GOOGLE',
          productId: 'old.year',
          tier: 'PRO',
          status: 'EXPIRED',
          entitlementEnd: null,
          autoRenew: false,
          managementUrl: null,
        },
      ],
    });
    expect(activeStoreProductIds(data)).toEqual(['pro.year']);
  });

  it('flags active web billing so in-app purchase can warn about double charging', () => {
    const web = summary({
      tier: 'SUPPORTER',
      subscriptions: [
        {
          provider: 'STRIPE',
          productId: 'web.supporter',
          tier: 'SUPPORTER',
          status: 'ACTIVE',
          entitlementEnd: null,
          autoRenew: true,
          managementUrl: null,
        },
      ],
    });
    expect(hasActiveWebSubscription(web)).toBe(true);
    expect(hasActiveWebSubscription(summary())).toBe(false);
  });
});
