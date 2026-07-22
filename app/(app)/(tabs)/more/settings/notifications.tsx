import { Stack, type Href, router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  AppState,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-screens/experimental';

import { friendlyError } from '@/src/api/errors';
import { Button } from '@/src/components/Button';
import { AppSymbol } from '@/src/components/AppSymbol';
import {
  useNotificationPreferencesQuery,
  useUpdateNotificationPreferences,
} from '@/src/features/notifications/useNotifications';
import {
  getPushPermissionState,
  type PushPermissionState,
} from '@/src/features/notifications/pushToken';
import type { NotificationPreferences } from '@/src/features/notifications/types';
import { hapticLight, hapticSuccess, hapticError } from '@/src/lib/haptics';
import { Colors } from '@/src/theme/colors';
import { useThemeColors } from '@/src/theme/useThemeColors';

function goBackToSettings() {
  if (router.canGoBack()) {
    router.back();
    return;
  }
  router.replace('/(app)/(tabs)/more/settings' as Href);
}

function PreferenceRow({
  title,
  description,
  value,
  onValueChange,
  disabled = false,
}: {
  title: string;
  description: string;
  value: boolean;
  onValueChange: (val: boolean) => void;
  disabled?: boolean;
}) {
  const theme = useThemeColors();
  return (
    <View className="flex-row items-center justify-between border-b border-border/80 px-4 py-4">
      <View className="mr-4 flex-1">
        <Text className="text-base font-semibold text-text-primary">{title}</Text>
        <Text className="mt-1 text-sm text-text-muted leading-5">{description}</Text>
      </View>
      <Switch
        trackColor={{ false: theme.border, true: Colors.brand }}
        thumbColor={Platform.OS === 'ios' ? undefined : theme.textPrimary}
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
      />
    </View>
  );
}

export default function NotificationSettingsScreen() {
  const theme = useThemeColors();

  const { data: preferences, isLoading, isError, error, refetch } = useNotificationPreferencesQuery();
  const updateMutation = useUpdateNotificationPreferences();
  const [osPermission, setOsPermission] = useState<PushPermissionState>('granted');

  useEffect(() => {
    let active = true;
    const checkPermission = async () => {
      try {
        const state = await getPushPermissionState();
        if (active) setOsPermission(state);
      } catch {
        // permission check fallback
      }
    };

    void checkPermission();

    const sub = AppState.addEventListener('change', (next) => {
      if (next === 'active') void checkPermission();
    });

    return () => {
      active = false;
      sub.remove();
    };
  }, []);

  const handleToggle = (key: keyof NotificationPreferences, newValue: boolean) => {
    if (!preferences) return;
    hapticLight();
    const updated = { ...preferences, [key]: newValue };
    updateMutation.mutate(updated, {
      onSuccess: () => {
        hapticSuccess();
      },
      onError: () => {
        hapticError();
      },
    });
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Notification settings',
          headerShown: true,
          headerLeft: () => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Back"
              hitSlop={12}
              onPress={goBackToSettings}
              style={{
                minWidth: 44,
                minHeight: 44,
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: Platform.OS === 'ios' ? -6 : 0,
              }}
            >
              <AppSymbol
                sf="chevron.left"
                size={22}
                tintColor={theme.textPrimary}
                fallback="←"
              />
            </Pressable>
          ),
        }}
      />
      <SafeAreaView
        edges={{ bottom: true }}
        style={{ flex: 1, backgroundColor: theme.surface }}
      >
        {isLoading ? (
          <View className="flex-1 items-center justify-center bg-surface">
            <ActivityIndicator color={Colors.brand} size="large" />
            <Text className="mt-3 text-sm text-text-muted">Loading preferences…</Text>
          </View>
        ) : isError ? (
          <View className="flex-1 bg-surface px-6 pt-6">
            <Text className="text-red-400">
              {friendlyError(error, 'Failed to load preferences')}
            </Text>
            <Button className="mt-4" label="Try again" onPress={() => void refetch()} />
          </View>
        ) : (
          <ScrollView
            className="flex-1 bg-surface"
            contentContainerClassName="px-6 pb-12 pt-4"
          >
            <Text className="text-2xl font-semibold text-text-primary">Push notifications</Text>
            <Text className="mt-1 text-sm text-text-muted">
              Choose which coaching alerts Coach Watts may send as push notifications on your
              signed-in devices.
            </Text>

            {osPermission === 'denied' ? (
              <View className="mt-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
                <View className="flex-row items-center gap-2">
                  <AppSymbol sf="exclamationmark.triangle" size={18} tintColor="#f59e0b" fallback="⚠️" />
                  <Text className="text-sm font-semibold text-amber-400">Notifications disabled in device settings</Text>
                </View>
                <Text className="mt-1.5 text-xs leading-4.5 text-text-muted">
                  System notifications are currently turned off for Coach Watts. Enable notifications in your phone settings to receive coaching alerts.
                </Text>
                <Pressable
                  className="mt-3 self-start active:opacity-75"
                  onPress={() => void Linking.openSettings()}
                >
                  <Text className="text-xs font-semibold text-amber-400">Open Device Settings ›</Text>
                </Pressable>
              </View>
            ) : null}

            <View className="mt-6 overflow-hidden rounded-xl border border-border bg-card">
              <PreferenceRow
                title="Daily Recommendation"
                description="Get notified when your daily training and recovery recommendation is ready."
                value={preferences?.RECOMMENDATION_READY ?? true}
                onValueChange={(val) => handleToggle('RECOMMENDATION_READY', val)}
                disabled={updateMutation.isPending}
              />
              <PreferenceRow
                title="Workout Analysis"
                description="Receive AI insights and summary reports on your completed workouts."
                value={preferences?.WORKOUT_ANALYSIS_READY ?? true}
                onValueChange={(val) => handleToggle('WORKOUT_ANALYSIS_READY', val)}
                disabled={updateMutation.isPending}
              />
              <PreferenceRow
                title="Coach Messages"
                description="Receive alerts when the AI Coach replies to your discussions."
                value={preferences?.COACH_MESSAGE ?? true}
                onValueChange={(val) => handleToggle('COACH_MESSAGE', val)}
                disabled={updateMutation.isPending}
              />
            </View>

            {updateMutation.isError ? (
              <Text className="mt-4 text-center text-sm text-red-400">
                Failed to save changes. Please try again.
              </Text>
            ) : null}
          </ScrollView>
        )}
      </SafeAreaView>
    </>
  );
}

