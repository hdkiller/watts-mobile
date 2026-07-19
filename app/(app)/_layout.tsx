import { Redirect, Stack } from 'expo-router';

import { useAuth } from '@/src/auth/AuthContext';
import { PushNotificationsBootstrap } from '@/src/features/notifications/PushNotificationsBootstrap';
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
    <>
      <PushNotificationsBootstrap />
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
      <Stack.Screen
        name="activity/index"
        options={{
          headerShown: true,
          title: 'Recent activity',
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name="activity/[id]"
        options={{
          headerShown: true,
          title: 'Activity',
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name="upcoming/index"
        options={{
          headerShown: true,
          title: 'Upcoming',
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name="athlete"
        options={{
          headerShown: true,
          title: 'Athlete',
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name="recovery-event"
        options={{
          headerShown: true,
          title: 'Recovery event',
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name="notifications"
        options={{
          headerShown: true,
          title: 'Notifications',
          presentation: 'card',
        }}
      />
    </Stack>
    </>
  );
}
