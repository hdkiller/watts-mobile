import '../global.css';

import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-gesture-handler';
import 'react-native-reanimated';

import type { ErrorBoundaryProps } from 'expo-router';

import { AuthProvider, useAuth } from '@/src/auth/AuthContext';
import { ErrorFallback } from '@/src/components/ErrorFallback';
import { useDeepLinkReturn } from '@/src/linking/useDeepLinkReturn';
import { initSentry } from '@/src/sentry';
import { Colors } from '@/src/theme/colors';
import { ThemePreferenceBootstrap } from '@/src/theme/ThemePreferenceBootstrap';
import { useThemeColors } from '@/src/theme/useThemeColors';

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return <ErrorFallback error={error} retry={retry} />;
}

SplashScreen.preventAutoHideAsync();
initSentry();

function RootNavigator() {
  const { status } = useAuth();
  const theme = useThemeColors();
  useDeepLinkReturn();

  useEffect(() => {
    if (status !== 'loading') {
      SplashScreen.hideAsync();
    }
  }, [status]);

  if (status === 'loading') {
    return (
      <View className="flex-1 items-center justify-center bg-surface">
        <ActivityIndicator color={Colors.brand} size="large" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.surface },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(app)" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemePreferenceBootstrap>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </ThemePreferenceBootstrap>
  );
}
