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

export type StorePackage = {
  id: string;
  productId: string;
  tier: Exclude<SubscriptionTier, 'FREE'>;
  period: 'MONTHLY' | 'ANNUAL';
  price: string;
  title: string;
  nativePackage: import('react-native-purchases').PurchasesPackage;
};
