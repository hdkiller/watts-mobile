import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { createEvent, fetchEvent, fetchEvents } from './api';
import { mapEventDetail, mapUpcomingEvents } from './mapEvents';
import type { CreateEventInput, EventApi } from './types';

export const EVENTS_QUERY_KEY = ['events', 'list'] as const;

export function eventDetailQueryKey(id: string) {
  return ['events', 'detail', id] as const;
}

export function useCreateEventMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateEventInput) => createEvent(input),
    onSuccess: async (created) => {
      if (created?.id) {
        queryClient.setQueryData<EventApi>(eventDetailQueryKey(created.id), created);
        queryClient.setQueryData<EventApi[]>(EVENTS_QUERY_KEY, (prev) => {
          if (!Array.isArray(prev)) return [created];
          if (prev.some((e) => e.id === created.id)) {
            return prev.map((e) => (e.id === created.id ? { ...e, ...created } : e));
          }
          return [created, ...prev];
        });
      }
      await queryClient.invalidateQueries({ queryKey: EVENTS_QUERY_KEY });
      if (created?.id) {
        await queryClient.invalidateQueries({ queryKey: eventDetailQueryKey(created.id) });
      }
    },
  });
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
