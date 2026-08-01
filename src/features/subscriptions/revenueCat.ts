import { Platform } from 'react-native';
import Purchases, {
  LOG_LEVEL,
  PRORATION_MODE,
  PURCHASES_ERROR_CODE,
  type PurchasesError,
  type PurchasesPackage,
} from 'react-native-purchases';

import {
  REVENUECAT_ANDROID_API_KEY,
  REVENUECAT_IOS_API_KEY,
  SUBSCRIPTION_PRO_PRODUCT_IDS,
  SUBSCRIPTION_SUPPORTER_PRODUCT_IDS,
} from '@/src/config/env';

import type { StoreIntroOffer, StorePackage } from './types';
import {
  classifyProductTier,
  computeAnnualSavingsPercentage,
  formatOfferPeriod,
  monthlyEquivalentPrice,
  packagePeriod,
} from './adapters';

let configuredUserId: string | null = null;
let identityOperation = Promise.resolve();

function platformKey(): string {
  return Platform.OS === 'ios'
    ? REVENUECAT_IOS_API_KEY
    : Platform.OS === 'android'
      ? REVENUECAT_ANDROID_API_KEY
      : '';
}

export function isRevenueCatAvailable(): boolean {
  return (Platform.OS === 'ios' || Platform.OS === 'android') && Boolean(platformKey());
}

let logHandlerRegistered = false;

function setupLogLevel(): void {
  if (__DEV__ && !logHandlerRegistered) {
    logHandlerRegistered = true;
    Purchases.setLogLevel(LOG_LEVEL.WARN);
    Purchases.setLogHandler((logLevel, message) => {
      if (logLevel === LOG_LEVEL.ERROR || logLevel === LOG_LEVEL.WARN) {
        console.warn('[RevenueCat]', message);
      }
    });
  }
}

/**
 * Awaits the most recently started identity sync so callers never read
 * `configuredUserId` mid-transition. Safe to call even if no sync has ever
 * been requested — resolves immediately, leaving `configuredUserId` null.
 */
function awaitIdentitySettled(): Promise<void> {
  return identityOperation;
}

export function synchronizeRevenueCatIdentity(userId: string | null): Promise<void> {
  identityOperation = identityOperation
    .then(async () => {
      if (!isRevenueCatAvailable()) return;
      setupLogLevel();
      const configured = await Purchases.isConfigured();
      if (userId) {
        if (!configured) {
          Purchases.configure({ apiKey: platformKey(), appUserID: userId });
        } else if (configuredUserId !== userId) {
          if (configuredUserId) await Purchases.logOut();
          await Purchases.logIn(userId);
        }
        configuredUserId = userId;
      } else if (configured && configuredUserId) {
        await Purchases.logOut();
        configuredUserId = null;
      }
    })
    .catch((error) => {
      console.warn('RevenueCat identity synchronization failed', error);
    });
  return identityOperation;
}

function mapIntroOffer(item: PurchasesPackage): StoreIntroOffer | null {
  const raw = item.product.introPrice;
  if (!raw) return null;
  const isFree = raw.price === 0;
  return {
    priceString: raw.priceString || (isFree ? 'Free' : `${raw.price}`),
    price: raw.price,
    periodLabel: formatOfferPeriod(raw.periodUnit ?? 'month', raw.periodNumberOfUnits ?? 1),
    cycles: raw.cycles > 0 ? raw.cycles : 1,
    type: isFree ? 'FREE_TRIAL' : 'INTRODUCTORY',
  };
}

export function mapStorePackages(packages: readonly PurchasesPackage[]): StorePackage[] {
  const mapped = packages.flatMap<StorePackage>((item) => {
    const tier = classifyProductTier(
      item.product.identifier,
      SUBSCRIPTION_SUPPORTER_PRODUCT_IDS,
      SUBSCRIPTION_PRO_PRODUCT_IDS,
    );
    const period = packagePeriod(item.identifier, item.packageType);
    if (!tier || !period) return [];

    const priceAmount = item.product.price;
    const priceString = item.product.priceString;

    return [
      {
        id: item.identifier,
        productId: item.product.identifier,
        tier,
        period,
        price: priceString,
        priceAmount,
        currencyCode: item.product.currencyCode,
        // Google reports a per-month string directly; derive it from the store's
        // own formatting elsewhere so symbol placement and separators survive.
        monthlyPriceString:
          period === 'ANNUAL'
            ? (item.product.pricePerMonthString ?? monthlyEquivalentPrice(priceString, priceAmount))
            : undefined,
        introOffer: mapIntroOffer(item),
        title: item.product.title,
        nativePackage: item,
      },
    ];
  });

  // Savings are only claimable against a real monthly package of the same tier.
  const monthlyByTier = new Map<string, number>();
  for (const pkg of mapped) {
    if (pkg.period === 'MONTHLY' && pkg.priceAmount) monthlyByTier.set(pkg.tier, pkg.priceAmount);
  }

  return mapped.map((pkg) =>
    pkg.period === 'ANNUAL'
      ? {
          ...pkg,
          savingsPercentage: computeAnnualSavingsPercentage(
            pkg.priceAmount,
            monthlyByTier.get(pkg.tier),
          ),
        }
      : pkg,
  );
}

export async function fetchStorePackages(): Promise<StorePackage[]> {
  if (!isRevenueCatAvailable()) return [];
  // Never configure the SDK here — that's synchronizeRevenueCatIdentity's job,
  // and it always passes the Coach Watts appUserID. Configuring anonymously
  // (no appUserID) would let offerings load under the wrong RC identity and
  // race whichever caller configures with the real one second.
  await awaitIdentitySettled();
  if (!configuredUserId) return [];
  const offerings = await Purchases.getOfferings();
  return mapStorePackages(offerings.current?.availablePackages ?? []);
}

export type PurchaseOutcome = 'purchased' | 'cancelled' | 'pending';

/**
 * @param replacesProductId Store product the athlete already holds. Google Play
 * requires it to replace a subscription rather than stack a second one; Apple
 * handles same-group changes itself, so it is ignored on iOS.
 */
export async function purchaseStorePackage(
  item: StorePackage,
  replacesProductId?: string | null,
): Promise<PurchaseOutcome> {
  await awaitIdentitySettled();
  if (!configuredUserId) {
    // Fail closed: never let a purchase attach to an anonymous RC identity.
    throw new Error(
      'Your account is still connecting to the store — please wait a moment and try again.',
    );
  }
  try {
    const productChange =
      Platform.OS === 'android' && replacesProductId
        ? {
            oldProductIdentifier: replacesProductId,
            prorationMode: PRORATION_MODE.IMMEDIATE_WITH_TIME_PRORATION,
          }
        : null;
    await Purchases.purchasePackage(item.nativePackage, null, productChange);
    return 'purchased';
  } catch (error) {
    const purchaseError = error as PurchasesError;
    if (
      purchaseError.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR ||
      purchaseError.userCancelled
    )
      return 'cancelled';
    if (purchaseError.code === PURCHASES_ERROR_CODE.PAYMENT_PENDING_ERROR) return 'pending';
    throw error;
  }
}

export async function restoreStorePurchases(): Promise<boolean> {
  if (!isRevenueCatAvailable()) return false;
  await awaitIdentitySettled();
  if (!configuredUserId) {
    // Fail closed: never restore into an anonymous RC identity.
    throw new Error(
      'Your account is still connecting to the store — please wait a moment and try again.',
    );
  }
  const info = await Purchases.restorePurchases();
  return Object.keys(info.entitlements.active).length > 0;
}
