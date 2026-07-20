import { Stack } from 'expo-router';

import { useThemeColors } from '@/src/theme/useThemeColors';

export default function TodayStackLayout() {
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
        name="planned/[id]"
        options={{ headerShown: true, title: 'Workout' }}
      />
      <Stack.Screen
        name="activity/index"
        options={{ headerShown: true, title: 'Recent activity' }}
      />
      <Stack.Screen
        name="activity/[id]"
        options={{ headerShown: true, title: 'Activity' }}
      />
      <Stack.Screen
        name="upcoming/index"
        options={{ headerShown: true, title: 'Upcoming' }}
      />
    </Stack>
  );
}
