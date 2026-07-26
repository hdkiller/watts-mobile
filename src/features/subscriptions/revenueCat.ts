import { Platform } from 'react-native';
import Purchases, {
  LOG_LEVEL,
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

import type { StorePackage } from './types';
import { classifyProductTier, packagePeriod } from './adapters';

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

export function synchronizeRevenueCatIdentity(userId: string | null): Promise<void> {
  identityOperation = identityOperation
    .then(async () => {
      if (!isRevenueCatAvailable()) return;
      const configured = await Purchases.isConfigured();
      if (userId) {
        if (!configured) {
          if (__DEV__) Purchases.setLogLevel(LOG_LEVEL.DEBUG);
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

export function mapStorePackages(packages: readonly PurchasesPackage[]): StorePackage[] {
  return packages.flatMap((item) => {
    const tier = classifyProductTier(
      item.product.identifier,
      SUBSCRIPTION_SUPPORTER_PRODUCT_IDS,
      SUBSCRIPTION_PRO_PRODUCT_IDS,
    );
    const period = packagePeriod(item.identifier, item.packageType);
    if (!tier || !period) return [];

    const priceAmount = item.product.price;
    const currencyCode = item.product.currencyCode;
    let monthlyPriceString: string | undefined;
    let savingsPercentage: number | undefined;

    if (period === 'ANNUAL' && typeof priceAmount === 'number' && priceAmount > 0) {
      const monthlyAmount = priceAmount / 12;
      // Extract currency symbol or format from priceString
      const symbolMatch = item.product.priceString.match(/^[^\d\s]+/);
      const symbol = symbolMatch ? symbolMatch[0] : (currencyCode || '$');
      monthlyPriceString = `${symbol}${monthlyAmount.toFixed(2)}/mo`;
      savingsPercentage = 33; // Default visual savings indicator for annual billing
    }

    const rawIntro = item.product.introPrice;
    const introOffer = rawIntro
      ? {
          priceString: rawIntro.priceString ?? (rawIntro.price === 0 ? 'Free trial' : `${rawIntro.price}`),
          period: rawIntro.periodNumberOfUnits ? `${rawIntro.periodNumberOfUnits} ${rawIntro.periodUnit.toLowerCase()}` : 'trial',
          type: rawIntro.price === 0 ? ('FREE_TRIAL' as const) : ('INTRODUCTORY' as const),
        }
      : null;

    return [
      {
        id: item.identifier,
        productId: item.product.identifier,
        tier,
        period,
        price: item.product.priceString,
        priceAmount,
        currencyCode,
        monthlyPriceString,
        savingsPercentage,
        introOffer,
        title: item.product.title,
        nativePackage: item,
      },
    ];
  });
}

export async function fetchStorePackages(): Promise<StorePackage[]> {
  if (!isRevenueCatAvailable()) return [];
  const configured = await Purchases.isConfigured();
  if (!configured) {
    const key = platformKey();
    if (key) {
      if (__DEV__) Purchases.setLogLevel(LOG_LEVEL.DEBUG);
      Purchases.configure({ apiKey: key });
    } else {
      return [];
    }
  }
  const offerings = await Purchases.getOfferings();
  return mapStorePackages(offerings.current?.availablePackages ?? []);
}


export type PurchaseOutcome = 'purchased' | 'cancelled' | 'pending';

export async function purchaseStorePackage(item: StorePackage): Promise<PurchaseOutcome> {
  try {
    await Purchases.purchasePackage(item.nativePackage);
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
  const info = await Purchases.restorePurchases();
  return Object.keys(info.entitlements.active).length > 0;
}

