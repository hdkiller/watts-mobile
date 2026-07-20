import { Stack } from 'expo-router';

import { useThemeColors } from '@/src/theme/useThemeColors';

export default function MoreStackLayout() {
  const theme = useThemeColors();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerStyle: { backgroundColor: theme.surface },
        headerTintColor: theme.textPrimary,
        contentStyle: { backgroundColor: theme.surface },
        headerBackButtonDisplayMode: 'minimal',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen
        name="athlete"
        options={{ headerShown: true, title: 'Athlete' }}
      />
      <Stack.Screen
        name="notifications"
        options={{ headerShown: true, title: 'Notifications' }}
      />
      <Stack.Screen
        name="settings/index"
        options={{ headerShown: true, title: 'Settings' }}
      />
      <Stack.Screen
        name="settings/notifications"
        options={{ headerShown: true, title: 'Notification settings' }}
      />
      <Stack.Screen
        name="settings/health"
        options={{ headerShown: true, title: 'Health Sync' }}
      />
      <Stack.Screen
        name="settings/units"
        options={{ headerShown: true, title: 'Units & locale' }}
      />
      <Stack.Screen
        name="settings/appearance"
        options={{ headerShown: true, title: 'Appearance' }}
      />
      <Stack.Screen
        name="settings/log"
        options={{ headerShown: true, title: 'Log defaults' }}
      />
      <Stack.Screen
        name="settings/sports"
        options={{ headerShown: true, title: 'Sports' }}
      />
      <Stack.Screen
        name="settings/coach"
        options={{ headerShown: true, title: 'Coach identity' }}
      />
      <Stack.Screen
        name="sports/[id]"
        options={{ headerShown: true, title: 'Sport profile' }}
      />
    </Stack>
  );
}
