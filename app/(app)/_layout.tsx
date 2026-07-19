import { Redirect, Stack } from 'expo-router';

import { useAuth } from '@/src/auth/AuthContext';
import { Colors } from '@/src/theme/colors';

export default function AppLayout() {
  const { status } = useAuth();

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
    <Stack
      screenOptions={{
        headerShown: false,
        headerStyle: { backgroundColor: Colors.background },
        headerTintColor: Colors.text,
        contentStyle: { backgroundColor: Colors.background },
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="planned/[id]"
        options={{
          headerShown: true,
          title: 'Workout',
          presentation: 'card',
        }}
      />
    </Stack>
  );
}
