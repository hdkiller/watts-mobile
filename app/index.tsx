import { Redirect } from 'expo-router';

import { useAuth } from '@/src/auth/AuthContext';

export default function Index() {
  const { status } = useAuth();

  if (status === 'needs_instance') {
    return <Redirect href="/(auth)/instance" />;
  }

  if (status === 'needs_login') {
    return <Redirect href="/(auth)/login" />;
  }

  if (status === 'authenticated') {
    return <Redirect href="/(app)/(tabs)/today" />;
  }

  return null;
}
