import { Stack } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-screens/experimental';

import { useAuth } from '@/src/auth/AuthContext';
import { friendlyError } from '@/src/api/errors';
import { PRIVACY_POLICY_URL, TERMS_OF_SERVICE_URL } from '@/src/features/account/paths';
import { canAcquireNativeSubscription, isOfficialHostedInstance } from '@/src/features/subscriptions/gating';
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
      setMessage('The store completed the action, but Coach Watts is still confirming it. Pull to refresh shortly.');
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
      if (outcome === 'pending') setMessage('Payment is pending. Access will update after the store confirms it.');
      if (outcome === 'purchased') await confirmWithServer('Subscription confirmed. Your Coach Watts access is up to date.');
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
    const fallback = provider === 'APPLE'
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
            <Text className="text-xs font-semibold uppercase tracking-widest text-text-muted">Current access</Text>
            {summary.isLoading ? <ActivityIndicator className="mt-4" color={theme.brand} /> : null}
            {summary.isError ? (
              <Text className="mt-3 text-sm text-danger">Could not load subscription status.</Text>
            ) : null}
            {summary.data ? (
              <>
                <Text className="mt-2 text-3xl font-bold text-text-primary">{summary.data.tier}</Text>
                {summary.data.subscriptions.map((item) => (
                  <View key={`${item.provider}:${item.productId}`} className="mt-4 border-t border-border pt-4">
                    <Text className="font-semibold text-text-primary">{providerLabels[item.provider]}</Text>
                    <Text className="mt-1 text-sm text-text-muted">{item.status.replaceAll('_', ' ')}</Text>
                    {item.entitlementEnd ? (
                      <Text className="mt-1 text-sm text-text-muted">Access through {new Date(item.entitlementEnd).toLocaleDateString()}</Text>
                    ) : null}
                    <Pressable className="mt-3 self-start rounded-lg border border-border px-4 py-2 active:opacity-75" onPress={() => void manage(item.provider, item.managementUrl)}>
                      <Text className="font-semibold text-text-primary">Manage with {providerLabels[item.provider]}</Text>
                    </Pressable>
                  </View>
                ))}
              </>
            ) : null}
          </View>

          {summary.data?.hasCollision ? (
            <View className="mt-4 rounded-xl border border-warning bg-card p-4">
              <Text className="font-semibold text-text-primary">Multiple active subscriptions</Text>
              <Text className="mt-1 text-sm text-text-muted">Your highest tier is active. Manage the subscription you no longer want with its provider above; Coach Watts will not cancel it automatically.</Text>
            </View>
          ) : null}

          {!hosted ? (
            <View className="mt-6 rounded-xl border border-border bg-card p-4">
              <Text className="font-semibold text-text-primary">Managed by this instance</Text>
              <Text className="mt-2 text-sm leading-5 text-text-muted">Watt Mind store purchases and restores are available only on the official hosted Coach Watts service. This screen shows access reported by your current instance.</Text>
            </View>
          ) : null}

          {hosted && !acquisitionEnabled ? (
            <View className="mt-6 rounded-xl border border-border bg-card p-4">
              <Text className="font-semibold text-text-primary">Store subscriptions are not available yet</Text>
              <Text className="mt-2 text-sm text-text-muted">Existing access remains active. Native purchase acquisition is currently disabled.</Text>
            </View>
          ) : null}

          {acquisitionEnabled && !summary.data?.acquisitionSuppressed ? (
            <View className="mt-8">
              <Text className="text-xl font-bold text-text-primary">Choose a plan</Text>
              <Text className="mt-2 text-sm leading-5 text-text-muted">Payment is charged to your store account. Subscriptions renew automatically unless canceled in store settings before renewal.</Text>
              {offerings.isLoading ? <ActivityIndicator className="mt-6" color={theme.brand} /> : null}
              {offerings.data?.map((item) => (
                <Pressable key={`${item.tier}:${item.period}:${item.id}`} disabled={Boolean(operation)} className="mt-4 rounded-2xl border border-border bg-card p-5 active:opacity-75" onPress={() => void purchase(item)}>
                  <View className="flex-row items-start justify-between gap-3">
                    <View className="flex-1">
                      <Text className="text-lg font-bold text-text-primary">{item.tier === 'PRO' ? 'Pro' : 'Supporter'}</Text>
                      <Text className="mt-1 text-sm text-text-muted">{item.period === 'ANNUAL' ? 'Annual' : 'Monthly'} subscription</Text>
                    </View>
                    <Text className="text-lg font-bold text-brand">{item.price}</Text>
                  </View>
                </Pressable>
              ))}
              {!offerings.isLoading && offerings.data?.length === 0 ? (
                <Text className="mt-4 text-sm text-text-muted">No store packages are available for this app build.</Text>
              ) : null}
            </View>
          ) : null}

          {acquisitionEnabled ? (
            <Pressable disabled={Boolean(operation)} className="mt-6 items-center rounded-xl border border-border px-4 py-3 active:opacity-75" onPress={() => void restore()}>
              <Text className="font-semibold text-text-primary">Restore Purchases</Text>
            </Pressable>
          ) : null}
          {operation ? <Text className="mt-4 text-center text-sm text-text-muted">{operation}</Text> : null}
          {message ? <Text className="mt-4 text-center text-sm text-text-primary">{message}</Text> : null}

          <View className="mt-8 flex-row justify-center gap-6">
            <Pressable onPress={() => void Linking.openURL(TERMS_OF_SERVICE_URL)}><Text className="text-sm font-semibold text-brand">Terms</Text></Pressable>
            <Pressable onPress={() => void Linking.openURL(PRIVACY_POLICY_URL)}><Text className="text-sm font-semibold text-brand">Privacy</Text></Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
