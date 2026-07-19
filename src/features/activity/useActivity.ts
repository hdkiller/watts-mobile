import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  fetchActivityPowerCurve,
  fetchActivityStreamCharts,
  fetchActivitySummary,
  fetchPlannedWorkoutDetail,
  fetchRecentActivities,
  fetchUpcomingPlanned,
  requestWorkoutAnalysis,
} from './api';
import { RECENT_ACTIVITY_LIMIT, UPCOMING_PLANNED_LIMIT, UPCOMING_WINDOW_DAYS } from './types';

export const RECENT_ACTIVITY_QUERY_KEY = ['activity', 'recent'] as const;
export const UPCOMING_PLANNED_QUERY_KEY = ['activity', 'upcoming'] as const;

export function activityDetailQueryKey(id: string) {
  return ['activity', 'detail', id] as const;
}

export function activityStreamsQueryKey(id: string) {
  return ['activity', 'streams', id] as const;
}

export function activityPowerCurveQueryKey(id: string) {
  return ['activity', 'power-curve', id] as const;
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
    refetchInterval: (query) => {
      const phase = query.state.data?.analysis.phase;
      // Keep the detail screen fresh while server-side analysis runs.
      return phase === 'analyzing' ? 5000 : false;
    },
  });
}

export function useRequestWorkoutAnalysis(id: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => requestWorkoutAnalysis(id!),
    onSuccess: async () => {
      if (!id) return;
      await queryClient.invalidateQueries({ queryKey: activityDetailQueryKey(id) });
      await queryClient.invalidateQueries({ queryKey: RECENT_ACTIVITY_QUERY_KEY });
    },
  });
}

export function useActivityStreamsQuery(id: string | undefined) {
  return useQuery({
    queryKey: activityStreamsQueryKey(id ?? ''),
    queryFn: () => fetchActivityStreamCharts(id!),
    enabled: Boolean(id),
    staleTime: 60_000,
  });
}

export function useActivityPowerCurveQuery(id: string | undefined) {
  return useQuery({
    queryKey: activityPowerCurveQueryKey(id ?? ''),
    queryFn: () => fetchActivityPowerCurve(id!),
    enabled: Boolean(id),
    staleTime: 60_000,
  });
}

export function usePlannedDetailQuery(id: string | undefined) {
  return useQuery({
    queryKey: plannedDetailQueryKey(id ?? ''),
    queryFn: () => fetchPlannedWorkoutDetail(id!),
    enabled: Boolean(id),
  });
}
