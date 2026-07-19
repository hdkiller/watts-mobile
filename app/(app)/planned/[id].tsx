import { Stack, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';

import { fetchPlannedWorkout } from '@/src/features/today/api';
import { formatDuration } from '@/src/features/today/mapTodayPayload';
import { Colors } from '@/src/theme/colors';

export default function PlannedWorkoutDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['planned-workout', id],
    queryFn: () => fetchPlannedWorkout(id!),
    enabled: Boolean(id),
  });

  const title = (data?.title as string) || 'Planned workout';
  const durationSec = typeof data?.durationSec === 'number' ? data.durationSec : null;
  const tss = typeof data?.tss === 'number' ? data.tss : null;
  const description = typeof data?.description === 'string' ? data.description : null;
  const type = typeof data?.type === 'string' ? data.type : null;

  return (
    <>
      <Stack.Screen options={{ title: 'Workout', headerShown: true }} />
      {isLoading ? (
        <View className="flex-1 items-center justify-center bg-surface-dark">
          <ActivityIndicator color={Colors.brand} />
        </View>
      ) : isError ? (
        <View className="flex-1 bg-surface-dark px-6 pt-6">
          <Text className="text-red-400">
            {error instanceof Error ? error.message : 'Failed to load workout'}
          </Text>
        </View>
      ) : (
        <ScrollView className="flex-1 bg-surface-dark" contentContainerClassName="px-6 pb-10 pt-4">
          <Text className="text-2xl font-semibold text-white">{title}</Text>
          <Text className="mt-2 text-sm text-ink-muted">
            {[type, formatDuration(durationSec), tss != null ? `TSS ${Math.round(tss)}` : null]
              .filter(Boolean)
              .join(' · ')}
          </Text>
          {description ? (
            <Text className="mt-6 text-base leading-6 text-zinc-200">{description}</Text>
          ) : (
            <Text className="mt-6 text-sm text-ink-muted">
              No description. Open the web app for full structure analysis.
            </Text>
          )}
        </ScrollView>
      )}
    </>
  );
}
