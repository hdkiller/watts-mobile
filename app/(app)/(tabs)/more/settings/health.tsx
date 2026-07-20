import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, AppState, Platform, ScrollView, Text, View } from 'react-native';
import * as Linking from 'expo-linking';
import { SafeAreaView } from 'react-native-screens/experimental';

import { Button } from '@/src/components/Button';
import { AppSymbol } from '@/src/components/AppSymbol';
import {
  disconnectHealth,
  getHealthAuthStatus,
  openHealthSettings,
  requestHealthAuth,
  type HealthStatusResult,
} from '@/src/features/log/healthAuth';
import { hapticError, hapticLight, hapticSuccess } from '@/src/lib/haptics';
import { Colors } from '@/src/theme/colors';
import { useThemeColors } from '@/src/theme/useThemeColors';

function StatusBadge({ status }: { status: string }) {
  let bg = 'bg-border-strong/80 border border-border-strong/50';
  let text = 'text-text-muted';
  let label = 'Not connected';
  let dotBg = 'bg-text-muted';

  if (status === 'connected' || status === 'unnecessary') {
    bg = 'bg-emerald-500/10 border border-emerald-500/25';
    text = 'text-emerald-400';
    label = 'Connected';
    dotBg = 'bg-emerald-400';
  } else if (status === 'partially_connected') {
    bg = 'bg-amber-500/10 border border-amber-500/25';
    text = 'text-amber-400';
    label = 'Partially connected';
    dotBg = 'bg-amber-400';
  } else if (status === 'not_available') {
    bg = 'bg-red-500/10 border border-red-500/25';
    text = 'text-red-400';
    label = 'Not available';
    dotBg = 'bg-red-500';
  }

  return (
    <View className={`flex-row items-center rounded-full px-2.5 py-1 ${bg}`}>
      <View className={`h-1.5 w-1.5 rounded-full mr-1.5 ${dotBg}`} />
      <Text className={`text-xs font-semibold ${text}`}>{label}</Text>
    </View>
  );
}

function PermissionRow({
  title,
  granted,
}: {
  title: string;
  granted: boolean;
}) {
  return (
    <View className="flex-row items-center justify-between border-t border-border/60 py-3.5">
      <Text className="text-sm font-medium text-text-primary">{title}</Text>
      <View className="flex-row items-center">
        <View
          className={`h-4.5 w-4.5 items-center justify-center rounded-full mr-2 ${
            granted ? 'bg-emerald-500/15' : 'bg-border-strong'
          }`}
        >
          {granted ? (
            <Text className="text-xs text-emerald-400 font-bold">✓</Text>
          ) : (
            <Text className="text-xs text-text-muted font-bold">×</Text>
          )}
        </View>
        <Text className={`text-sm font-medium ${granted ? 'text-emerald-400' : 'text-text-muted'}`}>
          {granted ? 'Granted' : 'Denied'}
        </Text>
      </View>
    </View>
  );
}

export default function HealthSyncSettingsScreen() {
  const theme = useThemeColors();

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [authStatus, setAuthStatus] = useState<HealthStatusResult>({ status: 'loading' });

  const loadStatus = async () => {
    try {
      const res = await getHealthAuthStatus();
      setAuthStatus(res);
    } catch (err) {
      console.warn('[HealthSettings] Failed to fetch health status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadStatus();

    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        void loadStatus();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const handleConnect = async () => {
    hapticLight();
    setBusy(true);
    try {
      const success = await requestHealthAuth();
      if (success) {
        hapticSuccess();
      } else {
        hapticError();
      }
      await loadStatus();
    } catch {
      hapticError();
    } finally {
      setBusy(false);
    }
  };

  const handleDisconnect = async () => {
    hapticLight();
    setBusy(true);
    try {
      const success = await disconnectHealth();
      if (success) {
        hapticSuccess();
      } else {
        hapticError();
      }
      await loadStatus();
    } catch {
      hapticError();
    } finally {
      setBusy(false);
    }
  };

  const handleManageSettings = async () => {
    hapticLight();
    await openHealthSettings();
  };

  const handleInstallHealthConnect = async () => {
    hapticLight();
    await Linking.openURL('https://play.google.com/store/apps/details?id=com.google.android.apps.healthdata');
  };

  const isIOS = Platform.OS === 'ios';

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Health Sync',
          headerShown: true,
        }}
      />
      <SafeAreaView
        edges={{ bottom: true }}
        style={{ flex: 1, backgroundColor: theme.surface }}
      >
        {loading ? (
          <View className="flex-1 items-center justify-center bg-surface">
            <ActivityIndicator color={Colors.brand} size="large" />
            <Text className="mt-3 text-sm text-text-muted">Reading status…</Text>
          </View>
        ) : (
          <ScrollView
            className="flex-1 bg-surface"
            contentContainerClassName="px-6 pb-12 pt-4"
          >
            <Text className="text-sm text-text-muted leading-5">
              Connect your device's native health store to prefill sleep duration and body weight metrics in your daily wellness check-ins.
            </Text>

            <View className="mt-6 rounded-xl border border-border bg-card/60 p-5">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-border-strong">
                    <AppSymbol
                      sf="heart.text.square.fill"
                      size={20}
                      tintColor="#ef4444"
                      fallback="❤️"
                    />
                  </View>
                  <View>
                    <Text className="text-base font-semibold text-text-primary">
                      {isIOS ? 'Apple Health' : 'Health Connect'}
                    </Text>
                    <Text className="text-xs text-text-muted">
                      {isIOS ? 'HealthKit Integration' : 'Android Health Hub'}
                    </Text>
                  </View>
                </View>
                <StatusBadge status={authStatus.status} />
              </View>

              <Text className="mt-4 text-sm text-text-body leading-5">
                {isIOS
                  ? 'Coach Watts requests read access to Apple Health to retrieve your body weight and sleep analysis for daily wellness logs.'
                  : 'Coach Watts connects to Health Connect to securely read sleep sessions and body weight records recorded on this device.'}
              </Text>

              {/* iOS Specific Area */}
              {isIOS && (
                <View className="mt-6 border-t border-border/80 pt-5">
                  {authStatus.status === 'should_request' ? (
                    <Button
                      label="Connect Apple Health"
                      onPress={() => void handleConnect()}
                      loading={busy}
                    />
                  ) : (
                    <View className="rounded-lg bg-surface/40 p-4 border border-border/50">
                      <Text className="text-xs font-semibold uppercase text-brand tracking-wider mb-2">
                        Permissions Info
                      </Text>
                      <Text className="text-xs text-text-muted leading-4.5">
                        Permissions are managed by iOS. If sleep or weight metrics are not syncing, please verify that read permissions are enabled in the native iOS Health App:
                      </Text>
                      <View className="mt-2.5">
                        <Text className="text-xs text-text-muted">1. Open the native Health App</Text>
                        <Text className="text-xs text-text-muted">2. Tap your Profile picture in the top-right</Text>
                        <Text className="text-xs text-text-muted">3. Go to Sharing &gt; Apps &gt; Coach Watts</Text>
                        <Text className="text-xs text-text-muted">4. Make sure both Sleep and Weight reads are ON</Text>
                      </View>
                    </View>
                  )}
                </View>
              )}

              {/* Android Specific Area */}
              {!isIOS && (
                <View className="mt-4">
                  {authStatus.status === 'not_available' ? (
                    <View className="mt-2 border-t border-border/80 pt-4">
                      <Text className="text-sm text-red-400 mb-4 leading-5">
                        Health Connect is required but currently unavailable or not installed. Please install it from the Google Play Store to continue.
                      </Text>
                      <Button
                        label="Install Health Connect"
                        onPress={() => void handleInstallHealthConnect()}
                      />
                    </View>
                  ) : (
                    <View className="mt-2">
                      <PermissionRow
                        title="Sleep session history"
                        granted={!!authStatus.details?.sleepGranted}
                      />
                      <PermissionRow
                        title="Body weight records"
                        granted={!!authStatus.details?.weightGranted}
                      />

                      <View className="mt-6 gap-3">
                        {authStatus.status !== 'connected' && (
                          <Button
                            label="Connect Health Connect"
                            onPress={() => void handleConnect()}
                            loading={busy}
                          />
                        )}

                        {authStatus.status !== 'not_connected' && (
                          <>
                            <Button
                              variant="secondary"
                              label="Manage in Health Connect"
                              onPress={() => void handleManageSettings()}
                            />
                            <Button
                              variant="danger"
                              label="Disconnect"
                              onPress={() => void handleDisconnect()}
                              loading={busy}
                            />
                          </>
                        )}
                      </View>
                    </View>
                  )}
                </View>
              )}
            </View>

            <View className="mt-6 rounded-xl border border-border bg-surface/20 p-5">
              <Text className="text-sm font-semibold text-text-primary">🔒 Privacy First</Text>
              <Text className="mt-2 text-xs text-text-muted leading-4.5">
                Your health data stays on your device. Sleep and weight readings are only sent to your Coach Watts account when you review and save the check-in form. We do not write data to Apple Health or Health Connect, nor do we include health metrics in crash logs.
              </Text>
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
    </>
  );
}
