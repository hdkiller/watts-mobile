import { Redirect, Stack, useSegments, type Href } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import { useAuth } from '@/src/auth/AuthContext';
import { ActivationUnavailable } from '@/src/features/activation/ActivationUnavailable';
import {
  activationHrefForStatus,
  useActivationStatus,
} from '@/src/features/activation/useActivationStatus';
import { APP_HREFS } from '@/src/linking/appHrefs';
import { Colors } from '@/src/theme/colors';
import { useThemeColors } from '@/src/theme/useThemeColors';

export default function ActivationLayout() {
  const { status } = useAuth();
  const theme = useThemeColors();
  const segments = useSegments();
  const activationQuery = useActivationStatus(status === 'authenticated');

  if (status === 'needs_instance') {
    return <Redirect href="/(auth)/instance" />;
  }
  if (status === 'needs_login') {
    return <Redirect href="/(auth)/login" />;
  }
  if (status === 'loading') {
    return null;
  }

  if (activationQuery.isLoading && !activationQuery.data) {
    return (
      <View className="flex-1 items-center justify-center bg-surface">
        <ActivityIndicator color={Colors.brand} />
      </View>
    );
  }
  if (activationQuery.isError) {
    return (
      <ActivationUnavailable
        error={activationQuery.error}
        isFetching={activationQuery.isFetching}
        onRetry={() => void activationQuery.refetch()}
      />
    );
  }

  const activation = activationQuery.data;
  const currentStep = segments[segments.length - 1];
  if (activation?.fullyActivated) {
    return <Redirect href={APP_HREFS.today as Href} />;
  }
  if (activation?.supportsActivation) {
    const requiredHref = activation.softActivated
      ? '/(activation)/connect'
      : activationHrefForStatus(activation);
    const requiredStep = requiredHref?.split('/').pop();
    if (requiredHref && currentStep !== requiredStep) {
      return <Redirect href={requiredHref as Href} />;
    }
  }

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
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="consent" options={{ title: 'Welcome' }} />
      <Stack.Screen name="goal" options={{ title: 'Your goal' }} />
      <Stack.Screen name="plan" options={{ title: 'Training plan' }} />
      <Stack.Screen name="insight" options={{ title: 'Your week' }} />
      <Stack.Screen name="connect" options={{ title: 'Connect data' }} />
    </Stack>
  );
}
