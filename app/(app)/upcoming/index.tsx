import { router, Stack, type Href } from 'expo-router';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from 'react-native';

import {
  formatActivityDate,
  formatDuration,
} from '@/src/features/activity/mapActivity';
import type { PlannedListItem } from '@/src/features/activity/types';
import { useUpcomingPlannedQuery } from '@/src/features/activity/useActivity';
import { Colors } from '@/src/theme/colors';

function PlannedRow({ item }: { item: PlannedListItem }) {
  const meta = [
    formatActivityDate(item.date),
    item.type,
    formatDuration(item.durationSec),
    item.tss != null ? `TSS ${Math.round(item.tss)}` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <Pressable
      className="mb-3 rounded-xl border border-zinc-800 bg-zinc-900/80 px-4 py-3.5 active:opacity-80"
      onPress={() => router.push(`/(app)/planned/${item.id}` as Href)}
    >
      <Text className="text-base font-semibold text-white">{item.title}</Text>
      {meta ? <Text className="mt-1.5 text-sm text-ink-muted">{meta}</Text> : null}
    </Pressable>
  );
}

export default function UpcomingPlannedScreen() {
  const { data, isLoading, isError, error, refetch, isRefetching } = useUpcomingPlannedQuery();

  return (
    <>
      <Stack.Screen options={{ title: 'Upcoming', headerShown: true }} />
      {isLoading && !data ? (
        <View className="flex-1 items-center justify-center bg-surface-dark">
          <ActivityIndicator color={Colors.brand} size="large" />
        </View>
      ) : isError ? (
        <View className="flex-1 bg-surface-dark px-6 pt-6">
          <Text className="text-red-400">
            {error instanceof Error ? error.message : 'Failed to load upcoming workouts'}
          </Text>
          <Pressable className="mt-4" onPress={() => void refetch()}>
            <Text className="text-sm font-medium text-brand">Try again</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          className="flex-1 bg-surface-dark"
          contentContainerClassName="px-6 pb-10 pt-4"
          data={data ?? []}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => void refetch()}
              tintColor={Colors.brand}
            />
          }
          ListEmptyComponent={
            <View className="pt-8">
              <Text className="text-base text-ink-muted">
                No upcoming planned workouts in the next two weeks.
              </Text>
            </View>
          }
          renderItem={({ item }) => <PlannedRow item={item} />}
        />
      )}
    </>
  );
}
