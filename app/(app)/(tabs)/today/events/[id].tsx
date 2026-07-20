import { Stack, useLocalSearchParams } from 'expo-router';
import { Linking, Pressable, ScrollView, Text, View } from 'react-native';

import { friendlyError } from '@/src/api/errors';
import { useAuth } from '@/src/auth/AuthContext';
import { Button } from '@/src/components/Button';
import { HeroStatTiles, type HeroStat } from '@/src/components/HeroStatTiles';
import { OfflineBanner } from '@/src/components/OfflineBanner';
import { DetailSkeleton } from '@/src/components/Skeleton';
import { openInstanceWeb } from '@/src/features/account/openInstanceWeb';
import { eventWebPath } from '@/src/features/events/mapEvents';
import type { EventDetail } from '@/src/features/events/types';
import { useEventDetailQuery } from '@/src/features/events/useEvents';
import { useOfflineCached } from '@/src/hooks/useOfflineCached';

function detailStats(data: EventDetail): HeroStat[] {
  const stats: HeroStat[] = [];
  if (data.distanceKm != null) {
    stats.push({ label: 'Distance', value: `${data.distanceKm} km` });
  }
  if (data.elevationM != null) {
    stats.push({ label: 'Elevation', value: `${data.elevationM} m` });
  }
  if (data.locationLabel) {
    stats.push({ label: 'Location', value: data.locationLabel });
  }
  return stats.slice(0, 3);
}

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { instanceUrl } = useAuth();
  const { data, isLoading, isError, error, refetch, dataUpdatedAt } = useEventDetailQuery(id);
  const { showCachedOffline, lastUpdatedLabel } = useOfflineCached({
    data,
    isError,
    dataUpdatedAt,
  });

  const openWeb = async () => {
    if (!id) return;
    await openInstanceWeb(instanceUrl, eventWebPath(id));
  };

  const openWebsite = async () => {
    if (!data?.websiteUrl) return;
    await Linking.openURL(data.websiteUrl);
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Event', headerShown: true }} />
      {isLoading && !data ? (
        <DetailSkeleton />
      ) : isError && !data ? (
        <View className="flex-1 bg-surface px-6 pt-6">
          <Text className="text-red-400">{friendlyError(error, 'Failed to load event')}</Text>
          <Pressable className="mt-4" hitSlop={8} onPress={() => void refetch()}>
            <Text className="text-sm font-medium text-brand">Try again</Text>
          </Pressable>
        </View>
      ) : data ? (
        <ScrollView className="flex-1 bg-surface" contentContainerClassName="px-6 pb-10 pt-4">
          <OfflineBanner visible={showCachedOffline} lastUpdatedLabel={lastUpdatedLabel} />

          {data.dateLabel ? (
            <Text className="text-xs font-semibold uppercase tracking-widest text-text-muted">
              {data.dateLabel}
            </Text>
          ) : null}

          <Text className="mt-2 text-2xl font-bold text-text-primary">{data.title}</Text>

          <View className="mt-2 flex-row flex-wrap items-center gap-2">
            {data.typeLine ? (
              <Text className="text-sm text-text-muted">{data.typeLine}</Text>
            ) : null}
            {data.priority ? (
              <View className="rounded-md border border-border bg-card px-2 py-0.5">
                <Text className="text-xs font-semibold uppercase text-text-body">
                  Priority {data.priority}
                </Text>
              </View>
            ) : null}
            {data.countdownLabel ? (
              <Text className="text-sm font-semibold text-brand">{data.countdownLabel}</Text>
            ) : null}
          </View>

          <HeroStatTiles stats={detailStats(data)} />

          {data.startTime ? (
            <View className="mt-6">
              <Text className="text-xs font-semibold uppercase tracking-widest text-text-muted">
                Start time
              </Text>
              <Text className="mt-2 text-base text-text-body">{data.startTime}</Text>
            </View>
          ) : null}

          {data.description ? (
            <View className="mt-6">
              <Text className="text-xs font-semibold uppercase tracking-widest text-text-muted">
                Description
              </Text>
              <Text className="mt-2 text-base leading-6 text-text-body">{data.description}</Text>
            </View>
          ) : null}

          {data.goals.length > 0 ? (
            <View className="mt-6">
              <Text className="text-xs font-semibold uppercase tracking-widest text-text-muted">
                Linked goals
              </Text>
              <View className="mt-2">
                {data.goals.map((goal) => {
                  const meta = [goal.status, goal.targetDateLabel].filter(Boolean).join(' · ');
                  return (
                    <View
                      key={goal.id}
                      className="border-b border-border/80 py-3"
                    >
                      <Text className="text-base font-medium text-text-primary">{goal.title}</Text>
                      {meta ? (
                        <Text className="mt-1 text-sm text-text-muted">{meta}</Text>
                      ) : null}
                    </View>
                  );
                })}
              </View>
            </View>
          ) : null}

          <View className="mt-8 gap-3">
            {data.websiteUrl ? (
              <Button label="Open website" variant="secondary" onPress={() => void openWebsite()} />
            ) : null}
            <Button label="Open web" variant="secondary" onPress={() => void openWeb()} />
          </View>
        </ScrollView>
      ) : null}
    </>
  );
}
