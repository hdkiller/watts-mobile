import { useQuery } from '@tanstack/react-query';

import { fetchEvents } from './api';
import { mapUpcomingEvents } from './mapEvents';

export const EVENTS_QUERY_KEY = ['events', 'list'] as const;

export function useUpcomingEventsQuery() {
  return useQuery({
    queryKey: EVENTS_QUERY_KEY,
    queryFn: fetchEvents,
    select: (data) => mapUpcomingEvents(data),
    staleTime: 60_000,
  });
}
