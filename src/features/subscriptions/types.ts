export type SubscriptionTier = 'FREE' | 'SUPPORTER' | 'PRO';
export type SubscriptionProvider = 'STRIPE' | 'APPLE' | 'GOOGLE';
export type ProviderSubscriptionStatus =
  | 'ACTIVE'
  | 'CANCELED'
  | 'GRACE_PERIOD'
  | 'BILLING_RETRY'
  | 'PAST_DUE'
  | 'PAUSED'
  | 'PENDING'
  | 'EXPIRED'
  | 'REVOKED'
  | 'UNKNOWN';

export type SubscriptionSummary = {
  tier: SubscriptionTier;
  hasCollision: boolean;
  acquisitionSuppressed: boolean;
  subscriptions: {
    provider: SubscriptionProvider;
    productId: string;
    tier: SubscriptionTier;
    status: ProviderSubscriptionStatus;
    entitlementEnd: string | null;
    autoRenew: boolean | null;
    managementUrl: string | null;
  }[];
};

export type StoreIntroOffer = {
  /** Store-formatted price for the offer period ("Free", "$0.99"). */
  priceString: string;
  /** Raw amount in the local currency; 0 for a free trial. */
  price: number;
  /** Human period for the offer ("7 days", "1 month"). */
  periodLabel: string;
  /** Billing cycles the offer applies for (Apple/Google `cycles`). */
  cycles: number;
  type: 'FREE_TRIAL' | 'INTRODUCTORY';
};

export type StorePackage = {
  id: string;
  productId: string;
  tier: Exclude<SubscriptionTier, 'FREE'>;
  period: 'MONTHLY' | 'ANNUAL';
  price: string;
  priceAmount?: number;
  currencyCode?: string;
  /** Annual packages only: store-formatted per-month equivalent ("$4.16"). */
  monthlyPriceString?: string;
  /** Annual packages only: real saving vs. the same tier's monthly package. */
  savingsPercentage?: number;
  introOffer?: StoreIntroOffer | null;
  title: string;
  nativePackage: import('react-native-purchases').PurchasesPackage;
};

/** How buying `pkg` relates to what the athlete already pays for. */
export type PlanChangeKind = 'current' | 'upgrade' | 'downgrade' | 'switch-period' | 'new';
