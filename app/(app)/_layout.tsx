import { Redirect, Stack } from 'expo-router';

import { useAuth } from '@/src/auth/AuthContext';
import { ActivationGate } from '@/src/features/activation/ActivationGate';
import { PushNotificationsBootstrap } from '@/src/features/notifications/PushNotificationsBootstrap';
import { HealthSyncRunner } from '@/src/features/health/HealthSyncRunner';
import { OfflineWellnessFlush } from '@/src/features/log/OfflineWellnessFlush';
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
      </Stack>
    </ActivationGate>
  );
}
