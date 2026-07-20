import { Stack } from 'expo-router';
import { ActivityIndicator, Platform, ScrollView, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-screens/experimental';

import { friendlyError } from '@/src/api/errors';
import { Button } from '@/src/components/Button';
import {
  useNotificationPreferencesQuery,
  useUpdateNotificationPreferences,
} from '@/src/features/notifications/useNotifications';
import type { NotificationPreferences } from '@/src/features/notifications/types';
import { hapticLight, hapticSuccess, hapticError } from '@/src/lib/haptics';
import { Colors } from '@/src/theme/colors';

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
  return (
    <View className="flex-row items-center justify-between border-b border-zinc-800/80 px-4 py-4">
      <View className="mr-4 flex-1">
        <Text className="text-base font-semibold text-white">{title}</Text>
        <Text className="mt-1 text-sm text-ink-muted leading-5">{description}</Text>
      </View>
      <Switch
        trackColor={{ false: '#27272a', true: Colors.brand }}
        thumbColor={Platform.OS === 'ios' ? undefined : '#fafafa'}
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
      />
    </View>
  );
}

export default function NotificationSettingsScreen() {
  const { data: preferences, isLoading, isError, error, refetch } = useNotificationPreferencesQuery();
  const updateMutation = useUpdateNotificationPreferences();

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
        }}
      />
      <SafeAreaView
        edges={{ bottom: true }}
        style={{ flex: 1, backgroundColor: Colors.background }}
      >
        {isLoading ? (
          <View className="flex-1 items-center justify-center bg-surface-dark">
            <ActivityIndicator color={Colors.brand} size="large" />
            <Text className="mt-3 text-sm text-ink-muted">Loading preferences…</Text>
          </View>
        ) : isError ? (
          <View className="flex-1 bg-surface-dark px-6 pt-6">
            <Text className="text-red-400">
              {friendlyError(error, 'Failed to load preferences')}
            </Text>
            <Button className="mt-4" label="Try again" onPress={() => void refetch()} />
          </View>
        ) : (
          <ScrollView
            className="flex-1 bg-surface-dark"
            contentContainerClassName="px-6 pb-12 pt-4"
          >
            <Text className="text-2xl font-semibold text-white">Push notifications</Text>
            <Text className="mt-1 text-sm text-ink-muted">
              Configure which updates you would like to receive as push notifications on this device.
            </Text>

            <View className="mt-6 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
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
                title="Sync Status"
                description="Receive alerts when your health device metrics (Whoop, Strava, etc.) finish syncing."
                value={preferences?.SYNC_COMPLETED ?? true}
                onValueChange={(val) => handleToggle('SYNC_COMPLETED', val)}
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
