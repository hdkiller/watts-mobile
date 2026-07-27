import type {
  PlanChangeKind,
  ProviderSubscriptionStatus,
  StoreIntroOffer,
  StorePackage,
  SubscriptionSummary,
  SubscriptionTier,
} from './types';

export function classifyProductTier(
  productId: string,
  supporterProductIds: readonly string[],
  proProductIds: readonly string[],
): Exclude<SubscriptionTier, 'FREE'> | null {
  if (proProductIds.includes(productId)) return 'PRO';
  if (supporterProductIds.includes(productId)) return 'SUPPORTER';
  return null;
}

export function packagePeriod(
  identifier: string,
  packageType: string,
): 'MONTHLY' | 'ANNUAL' | null {
  const normalized = `${identifier}:${packageType}`.toLowerCase();
  if (normalized.includes('annual')) return 'ANNUAL';
  if (normalized.includes('month')) return 'MONTHLY';
  return null;
}

/** Client CustomerInfo is diagnostic only; paid feature state always follows this server summary. */
export function canonicalSubscriptionTier(summary: SubscriptionSummary): SubscriptionTier {
  return summary.tier;
}

export function identityForSession(input: {
  authenticated: boolean;
  hostedAcquisitionEnabled: boolean;
  userId?: string | null;
}): string | null {
  return input.authenticated && input.hostedAcquisitionEnabled ? (input.userId ?? null) : null;
}

export function formatProviderSubscriptionStatus(status: ProviderSubscriptionStatus): {
  label: string;
  isUrgent: boolean;
  colorClass: string;
} {
  switch (status) {
    case 'ACTIVE':
      return { label: 'Active', isUrgent: false, colorClass: 'text-emerald-400' };
    case 'PAST_DUE':
      return {
        label: 'Past Due — Action Required',
        isUrgent: true,
        colorClass: 'text-red-400 font-semibold',
      };
    case 'BILLING_RETRY':
      return {
        label: 'Billing Retry — Action Required',
        isUrgent: true,
        colorClass: 'text-amber-400 font-semibold',
      };
    case 'GRACE_PERIOD':
      return {
        label: 'Grace Period — Update Payment Method',
        isUrgent: true,
        colorClass: 'text-amber-400 font-semibold',
      };
    case 'CANCELED':
      return { label: 'Canceled', isUrgent: false, colorClass: 'text-text-muted' };
    case 'EXPIRED':
      return { label: 'Expired', isUrgent: false, colorClass: 'text-text-muted' };
    case 'PAUSED':
      return { label: 'Paused', isUrgent: false, colorClass: 'text-text-muted' };
    default:
      return { label: status.replaceAll('_', ' '), isUrgent: false, colorClass: 'text-text-muted' };
  }
}

const TIER_RANK: Record<SubscriptionTier, number> = { FREE: 0, SUPPORTER: 1, PRO: 2 };

/** Statuses where the athlete still holds (or is being retried for) the product. */
const HOLDING_STATUSES: ReadonlySet<ProviderSubscriptionStatus> = new Set([
  'ACTIVE',
  'CANCELED',
  'GRACE_PERIOD',
  'BILLING_RETRY',
  'PAST_DUE',
  'PAUSED',
]);

/** Digits plus the separators stores use for grouping/decimals (incl. NBSP forms). */
const SEPARATORS = '.,\\u00A0\\u202F ';
const NUMERIC_TOKEN = new RegExp(`\\d[\\d${SEPARATORS}]*\\d|\\d`);
const SEPARATOR_TEST = new RegExp(`[${SEPARATORS}]`);

/**
 * Rewrite a store-formatted price with a different amount, preserving the
 * store's own symbol placement, separators and decimal count.
 * `"49,99 €"` + 4.1658 → `"4,17 €"`; `"¥5,800"` + 483 → `"¥483"`.
 * Returns null when the string carries no parsable amount.
 */
export function substitutePriceAmount(priceString: string, amount: number): string | null {
  const match = priceString.match(NUMERIC_TOKEN);
  if (!match) return null;
  const token = match[0];

  const decimalMatch = token.match(/[.,](\d{1,2})$/);
  const decimalSeparator = decimalMatch ? token[token.length - decimalMatch[1].length - 1]! : '';
  const decimals = decimalMatch ? decimalMatch[1].length : 0;
  const groupSeparator =
    [...token].reverse().find((ch) => SEPARATOR_TEST.test(ch) && ch !== decimalSeparator) ?? '';

  const fixed = amount.toFixed(decimals);
  const [whole = '0', fraction] = fixed.split('.');
  const grouped = groupSeparator
    ? whole.replace(/\B(?=(\d{3})+(?!\d))/g, groupSeparator)
    : (whole ?? '0');
  const rendered = fraction ? `${grouped}${decimalSeparator}${fraction}` : grouped;

  return priceString.replace(token, rendered);
}

/**
 * Real annual saving against the same tier's monthly package. Returns undefined
 * when there is nothing to compare against — never invent a discount claim.
 */
export function computeAnnualSavingsPercentage(
  annualAmount: number | undefined,
  monthlyAmount: number | undefined,
): number | undefined {
  if (!annualAmount || !monthlyAmount || annualAmount <= 0 || monthlyAmount <= 0) return undefined;
  const yearAtMonthlyRate = monthlyAmount * 12;
  const saving = Math.round(((yearAtMonthlyRate - annualAmount) / yearAtMonthlyRate) * 100);
  return saving >= 1 && saving < 100 ? saving : undefined;
}

/** Store-formatted per-month equivalent of an annual price. */
export function monthlyEquivalentPrice(
  annualPriceString: string,
  annualAmount: number | undefined,
): string | undefined {
  if (!annualAmount || annualAmount <= 0) return undefined;
  return substitutePriceAmount(annualPriceString, annualAmount / 12) ?? undefined;
}

/** "7 days", "1 month", "3 months" from the store's period unit + count. */
export function formatOfferPeriod(periodUnit: string, periodNumberOfUnits: number): string {
  const unit = periodUnit.toLowerCase().replace(/s$/, '');
  const count = periodNumberOfUnits > 0 ? periodNumberOfUnits : 1;
  return `${count} ${unit}${count === 1 ? '' : 's'}`;
}

/**
 * App Review requires the offer length *and* the converting price next to the
 * buy button — never just "includes a trial".
 */
export function formatIntroOfferDisclosure(
  offer: StoreIntroOffer,
  recurringPrice: string,
  period: 'MONTHLY' | 'ANNUAL',
): string {
  const cadence = period === 'ANNUAL' ? 'year' : 'month';
  if (offer.type === 'FREE_TRIAL') {
    return `${offer.periodLabel} free, then ${recurringPrice} per ${cadence}. Cancel anytime before the trial ends.`;
  }
  const cycles = offer.cycles > 1 ? ` for ${offer.cycles} periods` : '';
  return `${offer.priceString} for the first ${offer.periodLabel}${cycles}, then ${recurringPrice} per ${cadence}.`;
}

/** Store product ids the athlete currently holds through Apple or Google. */
export function activeStoreProductIds(summary: SubscriptionSummary | undefined): string[] {
  if (!summary) return [];
  return summary.subscriptions
    .filter(
      (item) =>
        (item.provider === 'APPLE' || item.provider === 'GOOGLE') &&
        HOLDING_STATUSES.has(item.status),
    )
    .map((item) => item.productId);
}

/**
 * True when access is billed somewhere the store cannot see — buying in-app
 * would charge the athlete twice for the same entitlement.
 */
export function hasActiveWebSubscription(summary: SubscriptionSummary | undefined): boolean {
  if (!summary) return false;
  return summary.subscriptions.some(
    (item) => item.provider === 'STRIPE' && HOLDING_STATUSES.has(item.status),
  );
}

/**
 * Compares by product id, not tier: a Supporter-monthly athlete must still be
 * able to move to Supporter-annual.
 */
export function planChangeKind(input: {
  pkg: Pick<StorePackage, 'productId' | 'tier' | 'period'>;
  currentTier: SubscriptionTier;
  activeProductIds: readonly string[];
}): PlanChangeKind {
  const { pkg, currentTier, activeProductIds } = input;
  if (activeProductIds.includes(pkg.productId)) return 'current';
  // No store product held: nothing to switch from, even if a web plan is active.
  if (activeProductIds.length === 0) return 'new';
  if (TIER_RANK[pkg.tier] > TIER_RANK[currentTier]) return 'upgrade';
  if (TIER_RANK[pkg.tier] < TIER_RANK[currentTier]) return 'downgrade';
  return 'switch-period';
}

export function planActionLabel(
  kind: PlanChangeKind,
  pkg: Pick<StorePackage, 'tier' | 'period' | 'price'>,
): string {
  const tierName = pkg.tier === 'PRO' ? 'Pro' : 'Supporter';
  switch (kind) {
    case 'current':
      return 'Current plan';
    case 'upgrade':
      return `Upgrade to ${tierName} · ${pkg.price}`;
    case 'downgrade':
      return `Switch to ${tierName} · ${pkg.price}`;
    case 'switch-period':
      return `Switch to ${pkg.period === 'ANNUAL' ? 'annual' : 'monthly'} · ${pkg.price}`;
    default:
      return `Subscribe · ${pkg.price}`;
  }
}

export function formatRenewalNotice(
  autoRenew: boolean | null,
  entitlementEnd: string | null,
): string | null {
  if (!entitlementEnd) return null;
  const dateStr = new Date(entitlementEnd).toLocaleDateString();
  if (autoRenew === true) {
    return `Renews automatically on ${dateStr}`;
  }
  if (autoRenew === false) {
    return `Cancels automatically on ${dateStr} (Access through ${dateStr})`;
  }
  return `Access through ${dateStr}`;
}
