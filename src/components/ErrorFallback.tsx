import { useEffect, useRef } from 'react';
import { ScrollView, Text, View } from 'react-native';
import type { ErrorBoundaryProps } from 'expo-router';

import { Button } from '@/src/components/Button';
import { Colors } from '@/src/theme/colors';

function captureOnce(error: Error) {
  try {
    // Lazy require so builds without Sentry stay lightweight (matches src/sentry.ts).
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Sentry = require('@sentry/react-native') as typeof import('@sentry/react-native');
    Sentry.captureException(error);
  } catch {
    // Sentry unavailable — ignore.
  }
}

export function ErrorFallback({ error, retry }: ErrorBoundaryProps) {
  const lastCaptured = useRef<Error | null>(null);

  useEffect(() => {
    if (lastCaptured.current === error) return;
    lastCaptured.current = error;
    captureOnce(error);
  }, [error]);

  return (
    <View className="flex-1 bg-surface-dark px-6" style={{ backgroundColor: Colors.background }}>
      <View className="flex-1 justify-center">
        <Text className="text-sm font-semibold uppercase tracking-widest text-brand">Coach Watts</Text>
        <Text className="mt-3 text-2xl font-semibold text-white">Something went wrong</Text>
        <Text className="mt-3 text-base leading-6 text-ink-muted">
          We hit an unexpected error. Your data is safe — try again, or reopen the app if it keeps
          happening.
        </Text>

        {__DEV__ ? (
          <ScrollView className="mt-6 max-h-48 rounded-xl border border-zinc-800 bg-zinc-900/80 p-3">
            <Text className="text-sm font-medium text-red-400">{error.message}</Text>
            {error.stack ? (
              <Text className="mt-2 font-mono text-xs text-ink-muted">{error.stack}</Text>
            ) : null}
          </ScrollView>
        ) : null}

        <Button className="mt-8" label="Try again" onPress={() => void retry()} />
      </View>
    </View>
  );
}
