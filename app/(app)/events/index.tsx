import { router, Stack, type Href } from 'expo-router';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';

import { friendlyError } from '@/src/api/errors';
import { useAuth } from '@/src/auth/AuthContext';
import { OfflineBanner } from '@/src/components/OfflineBanner';
import { ListSkeleton } from '@/src/components/Skeleton';
import { openInstanceWeb } from '@/src/features/account/openInstanceWeb';
import type { CalendarEventGlance } from '@/src/features/events/types';
import { useUpcomingEventsQuery } from '@/src/features/events/useEvents';
import { useOfflineCached } from '@/src/hooks/useOfflineCached';
import { APP_HREFS } from '@/src/linking/appHrefs';
import { Colors } from '@/src/theme/colors';

export default function UpcomingEventsListScreen() {
  const { instanceUrl } = useAuth();
  const { data, isLoading, isError, error, refetch, isRefetching, dataUpdatedAt } =
    useUpcomingEventsQuery();
  const { showCachedOffline, lastUpdatedLabel } = useOfflineCached({
    data,
    isError,
    dataUpdatedAt,
  });

  const openWeb = async () => {
    await openInstanceWeb(instanceUrl, '/events');
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Upcoming Events', headerShown: true }} />
      {isLoading && !data ? (
        <ListSkeleton />
      ) : isError && !data ? (
        <View className="flex-1 bg-surface px-6 pt-6">
          <Text className="text-red-400">
            {friendlyError(error, 'Failed to load upcoming events')}
          </Text>
          <Pressable className="mt-4" hitSlop={8} onPress={() => void refetch()}>
            <Text className="text-sm font-medium text-brand">Try again</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          className="flex-1 bg-surface"
          contentContainerClassName="px-6 pb-10 pt-4"
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => void refetch()}
              tintColor={Colors.brand}
            />
          }
        >
          <OfflineBanner visible={showCachedOffline} lastUpdatedLabel={lastUpdatedLabel} />

          {!data || data.length === 0 ? (
            <View className="pt-8">
              <Text className="text-base text-text-muted">No upcoming race or life events.</Text>
              {instanceUrl ? (
                <Pressable className="mt-4" hitSlop={8} onPress={() => void openWeb()}>
                  <Text className="text-sm font-semibold text-brand">Open web</Text>
                </Pressable>
              ) : null}
            </View>
          ) : (
            <View>
              {data.map((event) => (
                <EventListRow key={event.id} event={event} />
              ))}
              {instanceUrl ? (
                <Pressable className="mt-4" hitSlop={8} onPress={() => void openWeb()}>
                  <Text className="text-sm font-semibold text-brand">Manage events on web</Text>
                </Pressable>
              ) : null}
            </View>
          )}
        </ScrollView>
      )}
    </>
  );
}

function EventListRow({ event }: { event: CalendarEventGlance }) {
  return (
    <Pressable
      className="mb-3 flex-row items-center gap-3 rounded-xl border border-border bg-card/80 px-4 py-3.5 active:opacity-80"
      onPress={() => router.push(APP_HREFS.eventDetail(event.id) as Href)}
    >
      <View className="h-11 w-11 items-center justify-center rounded-lg border border-border bg-surface">
        {event.monthLabel ? (
          <Text className="text-[10px] font-bold uppercase leading-none text-text-muted">
            {event.monthLabel}
          </Text>
        ) : null}
        {event.dayLabel ? (
          <Text className="mt-0.5 text-sm font-bold leading-none text-text-primary">
            {event.dayLabel}
          </Text>
        ) : null}
      </View>
      <View className="min-w-0 flex-1">
        <Text className="text-base font-semibold text-text-primary" numberOfLines={1}>
          {event.title}
        </Text>
        <Text className="mt-1 text-sm text-text-muted" numberOfLines={1}>
          {[event.countdownLabel, event.meta].filter(Boolean).join(' · ')}
        </Text>
      </View>
      <Text className="text-text-muted">›</Text>
    </Pressable>
  );
}
