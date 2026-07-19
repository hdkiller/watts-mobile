import { Stack } from 'expo-router';

import { useAuth } from '@/src/auth/AuthContext';
import { AuthenticatedEntry } from '@/src/linking/AuthenticatedEntry';
import { Colors } from '@/src/theme/colors';

export default function AuthLayout() {
  const { status } = useAuth();

  if (status === 'authenticated') {
    return <AuthenticatedEntry />;
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.background },
        headerTintColor: Colors.text,
        contentStyle: { backgroundColor: Colors.background },
      }}
    />
  );
}
