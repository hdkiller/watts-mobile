import { Stack } from 'expo-router';

import { useThemeColors } from '@/src/theme/useThemeColors';

/** Keep Settings root under child routes so deep links still get a back target. */
export const unstable_settings = {
  anchor: 'index',
};

export default function SettingsStackLayout() {
  const theme = useThemeColors();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: theme.surface },
        headerTintColor: theme.textPrimary,
        contentStyle: { backgroundColor: theme.surface },
        headerBackButtonDisplayMode: 'minimal',
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Settings' }} />
      <Stack.Screen name="notifications" options={{ title: 'Notification settings' }} />
      <Stack.Screen name="health" options={{ title: 'Health Sync' }} />
      <Stack.Screen name="health-history" options={{ title: 'Sync history' }} />
      <Stack.Screen name="health-workouts" options={{ title: 'Recent workouts' }} />
      <Stack.Screen name="connected-apps" options={{ title: 'Connected Apps' }} />
      <Stack.Screen name="subscription" options={{ title: 'Subscription & Billing' }} />
      <Stack.Screen name="units" options={{ title: 'Units & locale' }} />
      <Stack.Screen name="appearance" options={{ title: 'Appearance' }} />
      <Stack.Screen name="log" options={{ title: 'Log defaults' }} />
      <Stack.Screen name="sports" options={{ title: 'Sports' }} />
      <Stack.Screen name="coach" options={{ title: 'Coach identity' }} />
    </Stack>
  );
}
