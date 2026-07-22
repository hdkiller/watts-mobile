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
      <Stack.Screen
        name="photo-meal"
        options={{
          presentation: 'fullScreenModal',
          animation: 'slide_from_bottom',
          gestureEnabled: true,
        }}
      />
    </Stack>
  );
}
