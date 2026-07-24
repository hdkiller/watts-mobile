import { Stack } from 'expo-router';

import { useThemeColors } from '@/src/theme/useThemeColors';

export default function PlanTabLayout() {
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
      <Stack.Screen name="index" options={{ title: 'Plan' }} />
    </Stack>
  );
}
