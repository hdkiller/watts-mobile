import { Stack } from 'expo-router';

import { useAuth } from '@/src/auth/AuthContext';
import { AuthenticatedEntry } from '@/src/linking/AuthenticatedEntry';
import { useThemeColors } from '@/src/theme/useThemeColors';

export default function AuthLayout() {
  const { status } = useAuth();
  const theme = useThemeColors();

  if (status === 'authenticated') {
    return <AuthenticatedEntry />;
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.surface },
        headerTintColor: theme.textPrimary,
        contentStyle: { backgroundColor: theme.surface },
        headerBackButtonDisplayMode: 'minimal',
      }}
    />
  );
}
