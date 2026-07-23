import { Stack } from 'expo-router';

import { useThemeColors } from '@/src/theme/useThemeColors';

/** Keep More root under inbox/settings routes so deep links still get a back target. */
export const unstable_settings = {
  anchor: 'index',
};

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
        name="notifications"
        options={{ headerShown: true, title: 'Notifications' }}
      />
      <Stack.Screen name="settings" options={{ headerShown: false }} />
      <Stack.Screen
        name="sports/[id]"
        options={{ headerShown: true, title: 'Sport profile' }}
      />
    </Stack>
  );
}
