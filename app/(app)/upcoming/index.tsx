import { router, Stack, type Href } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useMemo } from 'react';
import {
  Pressable,
  RefreshControl,
  SectionList,
  Text,
  View,
} from 'react-native';

import { friendlyError } from '@/src/api/errors';
import { useAuth } from '@/src/auth/AuthContext';
import { ListSkeleton } from '@/src/components/Skeleton';
import { SportIcon } from '@/src/components/SportIcon';
import {
  formatActivityDate,
  formatDuration,
} from '@/src/features/activity/mapActivity';
import { buildComplianceIndex, type ComplianceMark } from '@/src/features/activity/compliance';
import { ComplianceMarkView } from '@/src/features/activity/ComplianceMark';
import { groupUpcomingByDay } from '@/src/features/activity/groupUpcoming';
import type { PlannedListItem } from '@/src/features/activity/types';
import {
  useRecentActivityQuery,
  useUpcomingPlannedQuery,
} from '@/src/features/activity/useActivity';
import { useUpcomingEventsQuery } from '@/src/features/events/useEvents';
import { Colors } from '@/src/theme/colors';

function PlannedRow({
  item,
  mark,
}: {
  item: PlannedListItem;
  mark: ComplianceMark | undefined;
}) {
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
      <View className="flex-row items-center gap-3">
        <SportIcon type={item.type} size={14} />
        <View className="min-w-0 flex-1">
          <View className="flex-row items-center">
            <Text className="shrink text-base font-semibold text-white" numberOfLines={1}>
              {item.title}
            </Text>
            <ComplianceMarkView mark={mark} />
          </View>
          {meta ? <Text className="mt-1.5 text-sm text-ink-muted">{meta}</Text> : null}
        </View>
      </View>
    </Pressable>
  );
}

export default function UpcomingPlannedScreen() {
  const { instanceUrl } = useAuth();
  const { data, isLoading, isError, error, refetch, isRefetching } = useUpcomingPlannedQuery();
  const recent = useRecentActivityQuery();
  const eventsQuery = useUpcomingEventsQuery();
  const futurePlanned = useMemo(
    () =>
      (data ?? []).filter((item) => {
        const key = item.date ? new Date(item.date) : null;
        if (!key || Number.isNaN(key.getTime())) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const day = new Date(key);
        day.setHours(0, 0, 0, 0);
        return day.getTime() >= today.getTime();
      }),
    [data]
  );
  const sections = useMemo(() => groupUpcomingByDay(futurePlanned), [futurePlanned]);
  const compliance = useMemo(
    () => buildComplianceIndex(recent.data, data),
    [recent.data, data]
  );

  const openWeb = async () => {
    if (!instanceUrl) return;
    await WebBrowser.openBrowserAsync(`${instanceUrl.replace(/\/$/, '')}/calendar`);
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Upcoming', headerShown: true }} />
      {isLoading && !data ? (
        <ListSkeleton />
      ) : isError && !data ? (
        <View className="flex-1 bg-surface-dark px-6 pt-6">
          <Text className="text-red-400">
            {friendlyError(error, 'Failed to load upcoming workouts')}
          </Text>
          <Pressable className="mt-4" hitSlop={8} onPress={() => void refetch()}>
            <Text className="text-sm font-medium text-brand">Try again</Text>
          </Pressable>
        </View>
      ) : (
        <SectionList
          className="flex-1 bg-surface-dark"
          contentContainerClassName="px-6 pb-10 pt-4"
          sections={sections}
          keyExtractor={(item) => item.id}
          stickySectionHeadersEnabled={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => {
                void refetch();
                void eventsQuery.refetch();
              }}
              tintColor={Colors.brand}
            />
          }
          ListHeaderComponent={
            eventsQuery.data && eventsQuery.data.length > 0 ? (
              <View className="mb-6">
                <Text className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
                  Events
                </Text>
                <View className="mt-2">
                  {eventsQuery.data.slice(0, 5).map((event) => (
                    <Pressable
                      key={event.id}
                      className="mb-2 rounded-xl border border-zinc-800 bg-zinc-900/80 px-4 py-3 active:opacity-80"
                      onPress={() => void openWeb()}
                    >
                      <Text className="text-base font-semibold text-white">{event.title}</Text>
                      <Text className="mt-1 text-sm text-ink-muted">
                        {[event.countdownLabel, event.type].filter(Boolean).join(' · ')}
                      </Text>
                    </Pressable>
                  ))}
                </View>
                {instanceUrl ? (
                  <Pressable className="mt-1" hitSlop={8} onPress={() => void openWeb()}>
                    <Text className="text-sm font-semibold text-brand">Open web for events</Text>
                  </Pressable>
                ) : null}
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View className="pt-8">
              <Text className="text-base text-ink-muted">
                No upcoming planned workouts in the next two weeks.
              </Text>
            </View>
          }
          renderSectionHeader={({ section }) => (
            <Text className="mb-2 mt-4 text-xs font-semibold uppercase tracking-widest text-ink-muted">
              {section.title}
            </Text>
          )}
          renderItem={({ item }) => (
            <PlannedRow item={item} mark={compliance.forPlanned.get(item.id)} />
          )}
        />
      )}
    </>
  );
}
