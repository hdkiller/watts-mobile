import { useQuery } from '@tanstack/react-query';

import {
  fetchActivitySummary,
  fetchPlannedWorkoutDetail,
  fetchRecentActivities,
  fetchUpcomingPlanned,
} from './api';
import { RECENT_ACTIVITY_LIMIT, UPCOMING_PLANNED_LIMIT, UPCOMING_WINDOW_DAYS } from './types';

export const RECENT_ACTIVITY_QUERY_KEY = ['activity', 'recent'] as const;
export const UPCOMING_PLANNED_QUERY_KEY = ['activity', 'upcoming'] as const;

export function activityDetailQueryKey(id: string) {
  return ['activity', 'detail', id] as const;
}

export function plannedDetailQueryKey(id: string) {
  return ['activity', 'planned', id] as const;
}

export function useRecentActivityQuery() {
  return useQuery({
    queryKey: RECENT_ACTIVITY_QUERY_KEY,
    queryFn: () => fetchRecentActivities(RECENT_ACTIVITY_LIMIT),
  });
}

export function useUpcomingPlannedQuery() {
  return useQuery({
    queryKey: UPCOMING_PLANNED_QUERY_KEY,
    queryFn: () =>
      fetchUpcomingPlanned({
        limit: UPCOMING_PLANNED_LIMIT,
        windowDays: UPCOMING_WINDOW_DAYS,
      }),
  });
}

export function useActivitySummaryQuery(id: string | undefined) {
  return useQuery({
    queryKey: activityDetailQueryKey(id ?? ''),
    queryFn: () => fetchActivitySummary(id!),
    enabled: Boolean(id),
  });
}

export function usePlannedDetailQuery(id: string | undefined) {
  return useQuery({
    queryKey: plannedDetailQueryKey(id ?? ''),
    queryFn: () => fetchPlannedWorkoutDetail(id!),
    enabled: Boolean(id),
  });
}
