/* Hallmark · genre: modern-minimal · design-system: docs/DESIGN.md · designed-as-app */
import { Stack } from 'expo-router';
import { useState } from 'react';
import { Linking, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-screens/experimental';

import { useAuth } from '@/src/auth/AuthContext';
import { friendlyError } from '@/src/api/errors';
import { Button } from '@/src/components/Button';
import { Skeleton } from '@/src/components/Skeleton';
import { PRIVACY_POLICY_URL, TERMS_OF_SERVICE_URL } from '@/src/features/account/paths';
import {
  formatProviderSubscriptionStatus,
  formatRenewalNotice,
} from '@/src/features/subscriptions/adapters';
import {
  canAcquireNativeSubscription,
  isOfficialHostedInstance,
} from '@/src/features/subscriptions/gating';
import {
  isRevenueCatAvailable,
  purchaseStorePackage,
  restoreStorePurchases,
} from '@/src/features/subscriptions/revenueCat';
import type { StorePackage, SubscriptionProvider } from '@/src/features/subscriptions/types';
import {
  useReconcileSubscription,
  useStoreOfferings,
  useSubscriptionSummary,
} from '@/src/features/subscriptions/useSubscriptions';
import { hapticLight, hapticSuccess } from '@/src/lib/haptics';
import { useThemeColors } from '@/src/theme/useThemeColors';

const providerLabels: Record<SubscriptionProvider, string> = {
  APPLE: 'Apple App Store',
  GOOGLE: 'Google Play',
  STRIPE: 'Coach Watts web',
};

const TIER_FEATURES: Record<'SUPPORTER' | 'PRO', string[]> = {
  SUPPORTER: [
    'Full daily workout coaching & guidance',
    'Health biometrics & wearable auto-sync',
    'Log recovery, wellness & nutrition',
    'Personalized daily recommendations',
  ],
  PRO: [
    'Everything in Supporter',
    'Unlimited Coach AI chat & workout analysis',
    'Custom multi-week training plans & adaptation',
    'Structured interval exports & priority AI',
  ],
};

export default function SubscriptionScreen() {
  const theme = useThemeColors();
  const { instanceUrl } = useAuth();
  const hosted = isOfficialHostedInstance(instanceUrl);
  const acquisitionEnabled = canAcquireNativeSubscription(instanceUrl);
  const rcAvailable = isRevenueCatAvailable();
  const summary = useSubscriptionSummary();
  const offerings = useStoreOfferings(acquisitionEnabled && !summary.data?.acquisitionSuppressed);
  const reconcile = useReconcileSubscription();

  const [operation, setOperation] = useState<string | null>(null);
  const [purchasingPackageId, setPurchasingPackageId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  const confirmWithServer = async (successMessage: string) => {
    setOperation('Confirming with Coach Watts…');
    try {
      await reconcile.mutateAsync();
      hapticSuccess();
      setFeedback({ type: 'success', text: successMessage });
    } catch {
      setFeedback({
        type: 'info',
        text: 'The store completed the action, but Coach Watts is still confirming it. Pull down to refresh shortly.',
      });
    } finally {
      setOperation(null);
      setPurchasingPackageId(null);
    }
  };

  const purchase = async (item: StorePackage) => {
    setFeedback(null);
    setPurchasingPackageId(item.id);
    hapticLight();
    setOperation(`Opening ${item.tier === 'PRO' ? 'Pro' : 'Supporter'} checkout…`);
    try {
      const outcome = await purchaseStorePackage(item);
      if (outcome === 'cancelled') {
        setFeedback({ type: 'info', text: 'Purchase canceled. Nothing was charged.' });
      } else if (outcome === 'pending') {
        setFeedback({
          type: 'info',
          text: 'Payment is pending. Access will update after the store confirms it.',
        });
      } else if (outcome === 'purchased') {
        await confirmWithServer('Subscription confirmed! Your Coach Watts access is up to date.');
      }
    } catch (error) {
      setFeedback({
        type: 'error',
        text: friendlyError(error, 'Purchase could not be completed'),
      });
    } finally {
      setOperation(null);
      setPurchasingPackageId(null);
    }
  };

  const restore = async () => {
    if (!rcAvailable) return;
    setFeedback(null);
    hapticLight();
    setOperation('Restoring purchases…');
    try {
      const found = await restoreStorePurchases();
      if (!found) {
        if (summary.data?.tier && summary.data.tier !== 'FREE') {
          setFeedback({
            type: 'info',
            text: 'No restorable App Store or Google Play purchases were found for this store account. Your Coach Watts access is active via another provider (e.g. web subscription).',
          });
        } else {
          setFeedback({
            type: 'info',
            text: 'No restorable purchases were found for this store account. Make sure you are signed into the Apple ID or Google Play account used for purchase.',
          });
        }
        return;
      }
      await confirmWithServer('Purchases restored and linked to this Coach Watts account.');
    } catch (error) {
      setFeedback({
        type: 'error',
        text: friendlyError(error, 'Purchases could not be restored'),
      });
    } finally {
      setOperation(null);
    }
  };

  const openUrlSafely = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch {
      setFeedback({
        type: 'error',
        text: `Could not open link. Please visit ${url} in your browser.`,
      });
    }
  };

  const manage = async (provider: SubscriptionProvider, managementUrl: string | null) => {
    const webBillingUrl = `${(instanceUrl || 'https://coachwatts.com').replace(/\/$/, '')}/profile/settings?tab=billing`;
    const fallback =
      provider === 'APPLE'
        ? 'https://apps.apple.com/account/subscriptions'
        : provider === 'GOOGLE'
          ? 'https://play.google.com/store/account/subscriptions'
          : webBillingUrl;
    await openUrlSafely(managementUrl || fallback);
  };

  const currentTier = summary.data?.tier ?? 'FREE';
  const hasSubscriptions = (summary.data?.subscriptions.length ?? 0) > 0;

  return (
    <>
      <Stack.Screen options={{ title: 'Subscription & Billing' }} />
      <SafeAreaView edges={{ bottom: true }} style={{ flex: 1, backgroundColor: theme.surface }}>
        <ScrollView
          className="flex-1 bg-surface"
          contentContainerClassName="px-6 pb-12 pt-5"
          refreshControl={
            <RefreshControl
              refreshing={summary.isRefetching || offerings.isRefetching}
              onRefresh={() => {
                void summary.refetch();
                if (acquisitionEnabled && !summary.data?.acquisitionSuppressed) {
                  void offerings.refetch();
                }
              }}
              tintColor={theme.brand}
            />
          }
        >
          {/* Status Feedback Banner */}
          {feedback ? (
            <View
              accessibilityLiveRegion="polite"
              className={`mb-4 rounded-xl border p-4 ${
                feedback.type === 'error'
                  ? 'border-danger/40 bg-tint-error'
                  : feedback.type === 'success'
                    ? 'border-emerald-500/40 bg-emerald-500/10'
                    : 'border-brand/40 bg-brand/10'
              }`}
            >
              <Text
                className={`text-sm font-medium leading-5 ${
                  feedback.type === 'error'
                    ? 'text-red-400'
                    : feedback.type === 'success'
                      ? 'text-emerald-400'
                      : 'text-text-primary'
                }`}
              >
                {feedback.text}
              </Text>
            </View>
          ) : null}

          {/* Current Access Card */}
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
                <View className="mt-2 flex-row items-center justify-between">
                  <Text className="text-2xl font-bold text-text-primary">
                    {currentTier === 'PRO'
                      ? 'Pro Plan'
                      : currentTier === 'SUPPORTER'
                        ? 'Supporter Plan'
                        : 'Free Plan'}
                  </Text>
                  {currentTier !== 'FREE' ? (
                    <View className="rounded-full border border-brand/30 bg-brand/15 px-3 py-1">
                      <Text className="text-xs font-semibold text-brand">Active Member</Text>
                    </View>
                  ) : null}
                </View>

                {/* Specific Provider Subscriptions */}
                {summary.data.subscriptions.map((item) => {
                  const statusInfo = formatProviderSubscriptionStatus(item.status);
                  const renewalNotice = formatRenewalNotice(item.autoRenew, item.entitlementEnd);
                  return (
                    <View
                      key={`${item.provider}:${item.productId}`}
                      className="mt-4 border-t border-border pt-4"
                    >
                      <View className="flex-row items-center justify-between">
                        <Text className="font-semibold text-text-primary">
                          {providerLabels[item.provider]}
                        </Text>
                        <Text className={`text-xs font-medium ${statusInfo.colorClass}`}>
                          {statusInfo.label}
                        </Text>
                      </View>

                      {renewalNotice ? (
                        <Text className="mt-1 text-sm text-text-muted">{renewalNotice}</Text>
                      ) : null}

                      <Button
                        className="mt-3"
                        label={
                          statusInfo.isUrgent ? 'Update payment method' : 'Manage subscription'
                        }
                        variant={statusInfo.isUrgent ? 'primary' : 'secondary'}
                        onPress={() => void manage(item.provider, item.managementUrl)}
                      />
                    </View>
                  );
                })}

                {/* Fallback for paid tier with no active provider subscription objects returned */}
                {!hasSubscriptions && currentTier !== 'FREE' ? (
                  <View className="mt-4 border-t border-border pt-4">
                    <Text className="font-semibold text-text-primary">Coach Watts Web</Text>
                    <Text className="mt-1 text-sm leading-5 text-text-muted">
                      Your subscription was activated directly on coachwatts.com. Billing and
                      renewal options are managed on web.
                    </Text>
                    <Button
                      className="mt-3"
                      label="Manage web subscription"
                      variant="secondary"
                      onPress={() => void manage('STRIPE', null)}
                    />
                  </View>
                ) : null}

                {!hasSubscriptions && currentTier === 'FREE' ? (
                  <Text className="mt-2 text-sm leading-5 text-text-muted">
                    Upgrade to Supporter or Pro to unlock personalized workout plans, recovery
                    tracking, and unlimited AI coaching.
                  </Text>
                ) : null}
              </>
            ) : null}
          </View>

          {/* Collision Alert */}
          {summary.data?.hasCollision ? (
            <View className="mt-4 rounded-xl border border-modify/40 bg-modify/10 p-4">
              <Text className="font-semibold text-text-primary">Multiple active subscriptions</Text>
              <Text className="mt-1 text-sm leading-5 text-text-muted">
                Your highest tier is active. Manage the subscription you no longer want with its
                provider above; Coach Watts will not cancel it automatically.
              </Text>
            </View>
          ) : null}

          {/* Self-hosted Instance Notice */}
          {!hosted ? (
            <View className="mt-6 rounded-xl border border-border bg-card p-4">
              <Text className="font-semibold text-text-primary">Managed by this instance</Text>
              <Text className="mt-2 text-sm leading-5 text-text-muted">
                Store purchases and restores are available only on the official hosted Coach Watts
                service. This screen shows access reported by your current instance.
              </Text>
            </View>
          ) : null}

          {/* Native Acquisition Disabled Notice */}
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

          {/* Web Suppressed Notice */}
          {acquisitionEnabled && summary.data?.acquisitionSuppressed ? (
            <View className="mt-6 rounded-xl border border-border bg-card p-4">
              <Text className="font-semibold text-text-primary">Web subscription active</Text>
              <Text className="mt-2 text-sm leading-5 text-text-muted">
                In-app store purchases are disabled while your active subscription is managed on
                Coach Watts web.
              </Text>
              <Pressable className="mt-3" hitSlop={8} onPress={() => void manage('STRIPE', null)}>
                <Text className="text-sm font-semibold text-brand">
                  Manage on Coach Watts web →
                </Text>
              </Pressable>
            </View>
          ) : null}

          {/* Offerings Plan List */}
          {acquisitionEnabled && !summary.data?.acquisitionSuppressed ? (
            <View className="mt-8">
              <Text className="text-2xl font-bold text-text-primary">Choose a plan</Text>
              <Text className="mt-1 text-sm leading-5 text-text-muted">
                Charged to your Apple ID or Google Play account. Subscriptions renew automatically
                unless canceled before renewal.
              </Text>

              {offerings.isLoading ? (
                <View className="mt-6 gap-3">
                  <Skeleton className="h-36 w-full rounded-2xl" />
                  <Skeleton className="h-36 w-full rounded-2xl" />
                </View>
              ) : null}

              {offerings.isError ? (
                <View className="mt-4 rounded-xl border border-danger/40 bg-tint-error p-4">
                  <Text className="text-sm font-semibold text-red-400">
                    Could not load available store plans.
                  </Text>
                  <Text className="mt-1 text-xs text-red-300">
                    {!rcAvailable
                      ? 'RevenueCat API key is missing from environment config.'
                      : friendlyError(
                          offerings.error,
                          'Store service unavailable or unconfigured.',
                        )}
                  </Text>
                  <Pressable className="mt-3" hitSlop={8} onPress={() => void offerings.refetch()}>
                    <Text className="text-sm font-semibold text-brand">Retry loading plans</Text>
                  </Pressable>
                </View>
              ) : null}


              {offerings.data?.map((item) => {
                const isCurrentPlan = currentTier === item.tier;
                const isUpgrade = currentTier === 'SUPPORTER' && item.tier === 'PRO';
                const features = TIER_FEATURES[item.tier];

                return (
                  <View
                    key={`${item.tier}:${item.period}:${item.id}`}
                    className={`mt-4 rounded-2xl border bg-card p-5 ${
                      isCurrentPlan ? 'border-brand/40 bg-brand/5' : 'border-border'
                    }`}
                  >
                    <View className="flex-row items-start justify-between gap-3">
                      <View className="flex-1">
                        <View className="flex-row items-center gap-2">
                          <Text className="text-xl font-bold text-text-primary">
                            {item.tier === 'PRO' ? 'Pro' : 'Supporter'}
                          </Text>
                          {item.period === 'ANNUAL' && item.savingsPercentage ? (
                            <View className="rounded-full border border-emerald-500/30 bg-emerald-500/20 px-2.5 py-0.5">
                              <Text className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                                Save 33%
                              </Text>
                            </View>
                          ) : null}
                          {isCurrentPlan ? (
                            <View className="rounded-full bg-brand/20 px-2.5 py-0.5">
                              <Text className="text-[10px] font-bold uppercase tracking-wider text-brand">
                                Current
                              </Text>
                            </View>
                          ) : null}
                        </View>
                        <Text className="mt-1 text-sm text-text-muted">
                          {item.period === 'ANNUAL' ? 'Annual billing' : 'Monthly billing'}
                        </Text>
                      </View>

                      <View className="items-end">
                        <Text className="text-xl font-bold text-brand">{item.price}</Text>
                        {item.monthlyPriceString && item.period === 'ANNUAL' ? (
                          <Text className="mt-0.5 text-xs text-text-muted">
                            {item.monthlyPriceString}
                          </Text>
                        ) : null}
                      </View>
                    </View>

                    {item.introOffer ? (
                      <View className="mt-3 rounded-lg border border-border bg-surface px-3 py-1.5">
                        <Text className="text-xs font-medium text-brand">
                          🎉 Includes {item.introOffer.priceString} ({item.introOffer.period})
                        </Text>
                      </View>
                    ) : null}

                    {/* Features list */}
                    <View className="mt-4 gap-2 border-t border-border pt-4">
                      {features.map((feat) => (
                        <Text key={feat} className="text-xs leading-4 text-text-muted">
                          {feat}
                        </Text>
                      ))}
                    </View>

                    <Button
                      className="mt-5"
                      label={
                        isCurrentPlan
                          ? 'Current Plan'
                          : isUpgrade
                            ? `Upgrade to Pro · ${item.price}`
                            : `Subscribe · ${item.price}`
                      }
                      disabled={isCurrentPlan || Boolean(operation)}
                      loading={purchasingPackageId === item.id}
                      variant={isCurrentPlan ? 'secondary' : 'primary'}
                      onPress={() => void purchase(item)}
                    />
                  </View>
                );
              })}

              {!offerings.isLoading && !offerings.isError && offerings.data?.length === 0 ? (
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
                  • Subscription automatically renews unless auto-renew is turned off in store
                  settings at least 24 hours before the end of the current period.
                </Text>
                <Text className="mt-1.5 text-xs leading-5 text-text-muted">
                  • Account will be charged for renewal within 24 hours prior to the end of the
                  current period at the rate of the selected plan.
                </Text>
                <Text className="mt-1.5 text-xs leading-5 text-text-muted">
                  • You can manage your subscription or turn off auto-renewal anytime in your store
                  Account Settings after purchase.
                </Text>
              </View>
            </View>
          ) : null}

          {/* Restore Purchases Section */}
          {acquisitionEnabled && rcAvailable ? (
            <View className="mt-8 items-center border-t border-border pt-6">
              <Text className="text-center text-xs text-text-muted">
                Already subscribed on Apple ID or Google Play?
              </Text>
              <Pressable
                className="mt-2 px-4 py-2"
                hitSlop={8}
                disabled={Boolean(operation)}
                onPress={() => void restore()}
              >
                <Text
                  className={`text-sm font-semibold ${
                    operation === 'Restoring purchases…' ? 'text-text-muted' : 'text-brand'
                  }`}
                >
                  {operation === 'Restoring purchases…'
                    ? 'Restoring purchases…'
                    : 'Restore Purchases'}
                </Text>
              </Pressable>
            </View>
          ) : null}

          {/* In-flight generic operation status */}
          {operation ? (
            <Text className="mt-3 text-center text-xs text-text-muted">{operation}</Text>
          ) : null}

          {/* Billing Support Affordance */}
          <View className="mt-6 items-center">
            <Pressable
              hitSlop={8}
              onPress={() =>
                void openUrlSafely('mailto:support@coachwatts.com?subject=Billing%20Support')
              }
            >
              <Text className="text-xs text-text-muted underline">
                Need help? Contact Billing Support
              </Text>
            </Pressable>
          </View>

          {/* Terms & Privacy */}
          <View className="mt-6 flex-row justify-center gap-6">
            <Pressable
              accessibilityRole="link"
              accessibilityLabel="Terms of Service"
              hitSlop={8}
              onPress={() => void openUrlSafely(TERMS_OF_SERVICE_URL)}
            >
              <Text className="text-xs font-semibold text-brand">Terms of Service</Text>
            </Pressable>
            <Pressable
              accessibilityRole="link"
              accessibilityLabel="Privacy Policy"
              hitSlop={8}
              onPress={() => void openUrlSafely(PRIVACY_POLICY_URL)}
            >
              <Text className="text-xs font-semibold text-brand">Privacy Policy</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
