import { Stack, useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';

import { useAuth } from '@/src/auth/AuthContext';
import {
  absoluteInstanceUrl,
  formatActivityDate,
  formatDuration,
  workoutWebPath,
} from '@/src/features/activity/mapActivity';
import { useActivitySummaryQuery } from '@/src/features/activity/useActivity';
import { Colors } from '@/src/theme/colors';

export default function ActivitySummaryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { instanceUrl } = useAuth();
  const { data, isLoading, isError, error } = useActivitySummaryQuery(id);

  const openWeb = async () => {
    if (!instanceUrl) return;
    const path = id ? workoutWebPath(id) : '/';
    await WebBrowser.openBrowserAsync(absoluteInstanceUrl(instanceUrl, path));
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Activity', headerShown: true }} />
      {isLoading ? (
        <View className="flex-1 items-center justify-center bg-surface-dark">
          <ActivityIndicator color={Colors.brand} />
        </View>
      ) : isError ? (
        <View className="flex-1 bg-surface-dark px-6 pt-6">
          <Text className="text-red-400">
            {error instanceof Error ? error.message : 'Failed to load activity'}
          </Text>
        </View>
      ) : data ? (
        <ScrollView className="flex-1 bg-surface-dark" contentContainerClassName="px-6 pb-10 pt-4">
          <Text className="text-2xl font-semibold text-white">{data.title}</Text>
          <Text className="mt-2 text-sm text-ink-muted">
            {[
              formatActivityDate(data.date),
              data.type,
              formatDuration(data.durationSec),
              data.loadLabel,
            ]
              .filter(Boolean)
              .join(' · ')}
          </Text>
          <Text className={`mt-3 text-sm ${data.status.kind === 'failed' ? 'text-red-400' : 'text-ink-muted'}`}>
            {data.status.label}
          </Text>
          {data.description ? (
            <Text className="mt-6 text-base leading-6 text-zinc-200">{data.description}</Text>
          ) : (
            <Text className="mt-6 text-sm text-ink-muted">
              Lite summary only. Open the web app for charts and full analysis.
            </Text>
          )}
          <Pressable
            className="mt-8 items-center rounded-xl border border-zinc-700 py-3.5 active:opacity-80"
            onPress={() => void openWeb()}
          >
            <Text className="text-base font-semibold text-white">Open in Coach Watts</Text>
          </Pressable>
        </ScrollView>
      ) : null}
    </>
  );
}
