import type { ProviderSubscriptionStatus, SubscriptionSummary, SubscriptionTier } from './types';

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

