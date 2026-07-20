import { router, type Href } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import type { CalendarEventGlance } from '@/src/features/events/types';
import { useUpcomingEventsQuery } from '@/src/features/events/useEvents';
import { APP_HREFS } from '@/src/linking/appHrefs';

const GLANCE_LIMIT = 3;

export function UpcomingEventsGlance() {
  const { data, isError } = useUpcomingEventsQuery();

  if (isError || !data || data.length === 0) return null;

  const rows = data.slice(0, GLANCE_LIMIT);

  return (
    <View className="mt-8">
      <View className="flex-row items-baseline justify-between">
        <View className="flex-row items-baseline gap-2">
          <Text className="text-xs font-semibold uppercase tracking-widest text-text-muted">
            Upcoming Events
          </Text>
          <Text className="text-xs font-semibold text-text-muted">{data.length}</Text>
        </View>
        <Pressable
          className="py-1 active:opacity-70"
          hitSlop={8}
          onPress={() => router.push(APP_HREFS.eventsList as Href)}
        >
          <Text className="text-sm font-semibold text-brand">See all</Text>
        </Pressable>
      </View>

      <View className="mt-2">
        {rows.map((event) => (
          <EventGlanceRow key={event.id} event={event} />
        ))}
      </View>
    </View>
  );
}

function EventGlanceRow({ event }: { event: CalendarEventGlance }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${event.title}, ${event.countdownLabel}`}
      className="flex-row items-center gap-3 border-b border-border/80 py-3 active:opacity-80"
      onPress={() => router.push(APP_HREFS.eventDetail(event.id) as Href)}
    >
      <View className="h-11 w-11 items-center justify-center rounded-lg border border-border bg-card">
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
        <Text className="text-base font-medium text-text-primary" numberOfLines={1}>
          {event.title}
        </Text>
        {event.meta ? (
          <Text className="mt-1 text-sm text-text-muted" numberOfLines={1}>
            {event.meta}
          </Text>
        ) : null}
      </View>

      <Text className="shrink-0 text-xs font-semibold text-brand">{event.countdownLabel}</Text>
      <Text className="text-text-muted">›</Text>
    </Pressable>
  );
}
