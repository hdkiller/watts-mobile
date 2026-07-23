import { Redirect, Stack } from 'expo-router';

import { useAuth } from '@/src/auth/AuthContext';
import { ActivationGate } from '@/src/features/activation/ActivationGate';
import { PushNotificationsBootstrap } from '@/src/features/notifications/PushNotificationsBootstrap';
import { HealthSyncRunner } from '@/src/features/health/HealthSyncRunner';
import { OfflineWellnessFlush } from '@/src/features/log/OfflineWellnessFlush';
import { ScanMealQuickActionBridge } from '@/src/linking/ScanMealQuickActionBridge';
import { useThemeColors } from '@/src/theme/useThemeColors';

export default function AppLayout() {
  const { status } = useAuth();
  const theme = useThemeColors();

  if (status === 'needs_instance') {
    return <Redirect href="/(auth)/instance" />;
  }

  if (status === 'needs_login') {
    return <Redirect href="/(auth)/login" />;
  }

  if (status === 'loading') {
    return null;
  }

  return (
    <ActivationGate>
      <PushNotificationsBootstrap />
      <OfflineWellnessFlush />
      <HealthSyncRunner />
      <ScanMealQuickActionBridge />
      <Stack
        screenOptions={{
          headerShown: false,
          headerStyle: { backgroundColor: theme.surface },
          headerTintColor: theme.textPrimary,
          contentStyle: { backgroundColor: theme.surface },
          headerBackButtonDisplayMode: 'minimal',
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="daily-checkin"
          options={{
            headerShown: true,
            title: 'Coach check-in',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="recovery-event"
          options={{
            headerShown: true,
            title: 'Recovery event',
            presentation: 'modal',
          }}
        />
        <Stack.Screen name="athlete" options={{ headerShown: true, title: 'Athlete' }} />
        <Stack.Screen name="activity/index" options={{ headerShown: true, title: 'Recent activity' }} />
        <Stack.Screen name="activity/[id]" options={{ headerShown: true, title: 'Activity' }} />
        <Stack.Screen name="planned/[id]" options={{ headerShown: true, title: 'Workout' }} />
        <Stack.Screen name="upcoming/index" options={{ headerShown: true, title: 'Upcoming' }} />
        <Stack.Screen name="events/index" options={{ headerShown: true, title: 'Upcoming Events' }} />
        <Stack.Screen name="events/[id]" options={{ headerShown: true, title: 'Event' }} />
        <Stack.Screen name="health-sync" options={{ headerShown: true, title: 'Health Sync' }} />
        <Stack.Screen name="health-history" options={{ headerShown: true, title: 'Sync history' }} />
        <Stack.Screen name="health-workouts" options={{ headerShown: true, title: 'Recent workouts' }} />
        <Stack.Screen name="connected-apps" options={{ headerShown: true, title: 'Connected Apps' }} />
        <Stack.Screen name="sports/index" options={{ headerShown: true, title: 'Sports' }} />
        <Stack.Screen name="sports/[id]" options={{ headerShown: true, title: 'Sport profile' }} />
      </Stack>
    </ActivationGate>
  );
}
