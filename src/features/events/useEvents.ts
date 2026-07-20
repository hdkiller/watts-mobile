import { useQuery } from '@tanstack/react-query';

import { fetchEvent, fetchEvents } from './api';
import { mapEventDetail, mapUpcomingEvents } from './mapEvents';

export const EVENTS_QUERY_KEY = ['events', 'list'] as const;

export function eventDetailQueryKey(id: string) {
  return ['events', 'detail', id] as const;
}

export function useUpcomingEventsQuery() {
  return useQuery({
    queryKey: EVENTS_QUERY_KEY,
    queryFn: fetchEvents,
    select: (data) => mapUpcomingEvents(data),
    staleTime: 60_000,
  });
}

export function useEventDetailQuery(id: string | undefined) {
  return useQuery({
    queryKey: eventDetailQueryKey(id ?? ''),
    queryFn: () => fetchEvent(id!),
    enabled: Boolean(id),
    select: (data) => mapEventDetail(data),
    staleTime: 60_000,
  });
}
