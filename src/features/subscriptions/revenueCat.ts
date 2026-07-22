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
  return Platform.OS === 'ios' ? REVENUECAT_IOS_API_KEY : Platform.OS === 'android' ? REVENUECAT_ANDROID_API_KEY : '';
}

export function isRevenueCatAvailable(): boolean {
  return (Platform.OS === 'ios' || Platform.OS === 'android') && Boolean(platformKey());
}

export function synchronizeRevenueCatIdentity(userId: string | null): Promise<void> {
  identityOperation = identityOperation.then(async () => {
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
  }).catch((error) => {
    console.warn('RevenueCat identity synchronization failed', error);
  });
  return identityOperation;
}

export function mapStorePackages(packages: readonly PurchasesPackage[]): StorePackage[] {
  return packages.flatMap((item) => {
    const tier = classifyProductTier(
      item.product.identifier,
      SUBSCRIPTION_SUPPORTER_PRODUCT_IDS,
      SUBSCRIPTION_PRO_PRODUCT_IDS
    );
    const period = packagePeriod(item.identifier, item.packageType);
    if (!tier || !period) return [];
    return [{
      id: item.identifier,
      productId: item.product.identifier,
      tier,
      period,
      price: item.product.priceString,
      title: item.product.title,
      nativePackage: item,
    }];
  });
}

export async function fetchStorePackages(): Promise<StorePackage[]> {
  if (!isRevenueCatAvailable()) return [];
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
    if (purchaseError.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR || purchaseError.userCancelled) return 'cancelled';
    if (purchaseError.code === PURCHASES_ERROR_CODE.PAYMENT_PENDING_ERROR) return 'pending';
    throw error;
  }
}

export async function restoreStorePurchases(): Promise<boolean> {
  const info = await Purchases.restorePurchases();
  return Object.keys(info.entitlements.active).length > 0;
}
