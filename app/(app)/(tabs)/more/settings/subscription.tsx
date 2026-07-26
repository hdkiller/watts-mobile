/* Hallmark · genre: modern-minimal · design-system: docs/DESIGN.md · designed-as-app */
import { Stack } from 'expo-router';
import { useState } from 'react';
import { Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-screens/experimental';

import { useAuth } from '@/src/auth/AuthContext';
import { friendlyError } from '@/src/api/errors';
import { Button } from '@/src/components/Button';
import { Skeleton } from '@/src/components/Skeleton';
import { PRIVACY_POLICY_URL, TERMS_OF_SERVICE_URL } from '@/src/features/account/paths';
import {
  canAcquireNativeSubscription,
  isOfficialHostedInstance,
} from '@/src/features/subscriptions/gating';
import {
  purchaseStorePackage,
  restoreStorePurchases,
} from '@/src/features/subscriptions/revenueCat';
import type { StorePackage, SubscriptionProvider } from '@/src/features/subscriptions/types';
import {
  useReconcileSubscription,
  useStoreOfferings,
  useSubscriptionSummary,
} from '@/src/features/subscriptions/useSubscriptions';
import { useThemeColors } from '@/src/theme/useThemeColors';

const providerLabels: Record<SubscriptionProvider, string> = {
  APPLE: 'Apple App Store',
  GOOGLE: 'Google Play',
  STRIPE: 'Coach Watts web',
};

export default function SubscriptionScreen() {
  const theme = useThemeColors();
  const { instanceUrl } = useAuth();
  const hosted = isOfficialHostedInstance(instanceUrl);
  const acquisitionEnabled = canAcquireNativeSubscription(instanceUrl);
  const summary = useSubscriptionSummary();
  const offerings = useStoreOfferings(acquisitionEnabled && !summary.data?.acquisitionSuppressed);
  const reconcile = useReconcileSubscription();
  const [operation, setOperation] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const confirmWithServer = async (successMessage: string) => {
    setOperation('Confirming with Coach Watts…');
    try {
      await reconcile.mutateAsync();
      setMessage(successMessage);
    } catch {
      setMessage(
        'The store completed the action, but Coach Watts is still confirming it. Pull to refresh shortly.',
      );
    } finally {
      setOperation(null);
    }
  };

  const purchase = async (item: StorePackage) => {
    setMessage(null);
    setOperation(`Opening ${item.tier === 'PRO' ? 'Pro' : 'Supporter'} checkout…`);
    try {
      const outcome = await purchaseStorePackage(item);
      if (outcome === 'cancelled') setMessage('Purchase canceled. Nothing was charged.');
      if (outcome === 'pending')
        setMessage('Payment is pending. Access will update after the store confirms it.');
      if (outcome === 'purchased')
        await confirmWithServer('Subscription confirmed. Your Coach Watts access is up to date.');
    } catch (error) {
      setMessage(friendlyError(error, 'Purchase could not be completed'));
    } finally {
      setOperation(null);
    }
  };

  const restore = async () => {
    setMessage(null);
    setOperation('Restoring purchases…');
    try {
      const found = await restoreStorePurchases();
      if (!found) {
        setMessage('No restorable purchases were found for this store account.');
        return;
      }
      await confirmWithServer('Purchases restored and linked to this Coach Watts account.');
    } catch (error) {
      setMessage(friendlyError(error, 'Purchases could not be restored'));
    } finally {
      setOperation(null);
    }
  };

  const manage = async (provider: SubscriptionProvider, managementUrl: string | null) => {
    const fallback =
      provider === 'APPLE'
        ? 'https://apps.apple.com/account/subscriptions'
        : provider === 'GOOGLE'
          ? 'https://play.google.com/store/account/subscriptions'
          : `${instanceUrl?.replace(/\/$/, '')}/profile/settings?tab=billing`;
    await Linking.openURL(managementUrl || fallback);
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Subscription & Billing' }} />
      <SafeAreaView edges={{ bottom: true }} style={{ flex: 1, backgroundColor: theme.surface }}>
        <ScrollView className="flex-1 bg-surface" contentContainerClassName="px-6 pb-12 pt-5">
          <View className="rounded-2xl border border-border bg-card p-5">
            <Text className="text-xs font-semibold uppercase tracking-widest text-text-muted">
              Current access
            </Text>
            {summary.isLoading ? (
              <View className="mt-4 gap-3">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </View>
            ) : null}
            {summary.isError ? (
              <View className="mt-3 rounded-xl border border-danger/40 bg-tint-error p-3">
                <Text className="text-sm text-red-400">Could not load subscription status.</Text>
                <Pressable className="mt-2" hitSlop={8} onPress={() => void summary.refetch()}>
                  <Text className="text-sm font-semibold text-brand">Retry</Text>
                </Pressable>
              </View>
            ) : null}
            {summary.data ? (
              <>
                <Text className="mt-2 text-2xl font-semibold text-text-primary">
                  {summary.data.tier}
                </Text>
                {summary.data.subscriptions.map((item) => (
                  <View
                    key={`${item.provider}:${item.productId}`}
                    className="mt-4 border-t border-border pt-4"
                  >
                    <Text className="font-semibold text-text-primary">
                      {providerLabels[item.provider]}
                    </Text>
                    <Text className="mt-1 text-sm text-text-muted">
                      {item.status.replaceAll('_', ' ')}
                    </Text>
                    {item.entitlementEnd ? (
                      <Text className="mt-1 text-sm text-text-muted">
                        Access through {new Date(item.entitlementEnd).toLocaleDateString()}
                      </Text>
                    ) : null}
                    <Button
                      className="mt-3"
                      label={`Manage with ${providerLabels[item.provider]}`}
                      variant="secondary"
                      onPress={() => void manage(item.provider, item.managementUrl)}
                    />
                  </View>
                ))}
              </>
            ) : null}
          </View>

          {summary.data?.hasCollision ? (
            <View className="mt-4 rounded-xl border border-modify/40 bg-modify/10 p-4">
              <Text className="font-semibold text-text-primary">Multiple active subscriptions</Text>
              <Text className="mt-1 text-sm text-text-muted">
                Your highest tier is active. Manage the subscription you no longer want with its
                provider above; Coach Watts will not cancel it automatically.
              </Text>
            </View>
          ) : null}

          {!hosted ? (
            <View className="mt-6 rounded-xl border border-border bg-card p-4">
              <Text className="font-semibold text-text-primary">Managed by this instance</Text>
              <Text className="mt-2 text-sm leading-5 text-text-muted">
                Store purchases and restores are available only on the official hosted Coach Watts
                service. This screen shows access reported by your current instance.
              </Text>
            </View>
          ) : null}

          {hosted && !acquisitionEnabled ? (
            <View className="mt-6 rounded-xl border border-border bg-card p-4">
              <Text className="font-semibold text-text-primary">
                Store subscriptions are not available yet
              </Text>
              <Text className="mt-2 text-sm text-text-muted">
                Existing access remains active. Native purchase acquisition is currently disabled.
              </Text>
            </View>
          ) : null}

          {acquisitionEnabled && !summary.data?.acquisitionSuppressed ? (
            <View className="mt-8">
              <Text className="text-2xl font-semibold text-text-primary">Choose a plan</Text>
              <Text className="mt-1 text-sm text-text-muted">
                Supporter and Pro grant access across Coach Watts devices.
              </Text>
              {offerings.isLoading ? (
                <View className="mt-6 gap-3">
                  <Skeleton className="h-24 w-full rounded-2xl" />
                  <Skeleton className="h-24 w-full rounded-2xl" />
                </View>
              ) : null}
              {offerings.data?.map((item) => (
                <View
                  key={`${item.tier}:${item.period}:${item.id}`}
                  className="mt-4 rounded-2xl border border-border bg-card p-5"
                >
                  <View className="flex-row items-start justify-between gap-3">
                    <View className="flex-1">
                      <Text className="text-lg font-semibold text-text-primary">
                        {item.tier === 'PRO' ? 'Pro' : 'Supporter'}
                      </Text>
                      <Text className="mt-1 text-sm text-text-muted">
                        {item.period === 'ANNUAL' ? 'Annual' : 'Monthly'} auto-renewable subscription
                      </Text>
                    </View>
                    <Text className="text-lg font-semibold text-brand">{item.price}</Text>
                  </View>
                  <Button
                    className="mt-4"
                    label={`Subscribe · ${item.price}`}
                    disabled={Boolean(operation)}
                    loading={operation?.includes('checkout') ?? false}
                    onPress={() => void purchase(item)}
                  />
                </View>
              ))}
              {!offerings.isLoading && offerings.data?.length === 0 ? (
                <Text className="mt-4 text-sm text-text-muted">
                  No store packages are available for this app build.
                </Text>
              ) : null}

              <View className="mt-6 rounded-xl border border-border bg-card/60 p-4">
                <Text className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                  Subscription & Auto-Renewal Terms
                </Text>
                <Text className="mt-2 text-xs leading-5 text-text-muted">
                  • Payment is charged to your store account at confirmation of purchase.
                </Text>
                <Text className="mt-1.5 text-xs leading-5 text-text-muted">
                  • Subscription automatically renews unless auto-renew is turned off in store settings
                  at least 24 hours before the end of the current period.
                </Text>
                <Text className="mt-1.5 text-xs leading-5 text-text-muted">
                  • Account will be charged for renewal within 24 hours prior to the end of the current
                  period at the rate of the selected plan.
                </Text>
                <Text className="mt-1.5 text-xs leading-5 text-text-muted">
                  • You can manage your subscription or turn off auto-renewal anytime in your store
                  Account Settings after purchase.
                </Text>
              </View>
            </View>
          ) : null}

          {acquisitionEnabled ? (
            <Button
              className="mt-6"
              label="Restore Purchases"
              variant="secondary"
              disabled={Boolean(operation)}
              loading={operation === 'Restoring purchases…'}
              onPress={() => void restore()}
            />
          ) : null}
          {operation ? (
            <Text className="mt-4 text-center text-sm text-text-muted">{operation}</Text>
          ) : null}
          {message ? (
            <Text className="mt-4 text-center text-sm text-text-primary">{message}</Text>
          ) : null}

          <View className="mt-8 flex-row justify-center gap-6">
            <Pressable hitSlop={8} onPress={() => void Linking.openURL(TERMS_OF_SERVICE_URL)}>
              <Text className="text-sm font-semibold text-brand">Terms</Text>
            </Pressable>
            <Pressable hitSlop={8} onPress={() => void Linking.openURL(PRIVACY_POLICY_URL)}>
              <Text className="text-sm font-semibold text-brand">Privacy</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
