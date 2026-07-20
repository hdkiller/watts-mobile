import { Stack } from 'expo-router';

import { useThemeColors } from '@/src/theme/useThemeColors';

export default function LogStackLayout() {
  const theme = useThemeColors();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.surface },
      }}
    >
      <Stack.Screen name="index" />
    </Stack>
  );
}
