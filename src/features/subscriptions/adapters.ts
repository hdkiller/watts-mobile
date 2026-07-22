import type { SubscriptionSummary, SubscriptionTier } from './types';

export function classifyProductTier(
  productId: string,
  supporterProductIds: readonly string[],
  proProductIds: readonly string[]
): Exclude<SubscriptionTier, 'FREE'> | null {
  if (proProductIds.includes(productId)) return 'PRO';
  if (supporterProductIds.includes(productId)) return 'SUPPORTER';
  return null;
}

export function packagePeriod(identifier: string, packageType: string): 'MONTHLY' | 'ANNUAL' | null {
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
  return input.authenticated && input.hostedAcquisitionEnabled ? input.userId ?? null : null;
}
