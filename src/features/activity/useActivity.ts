import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { QueryClient } from '@tanstack/react-query';

import { ATHLETE_PROFILE_KEY } from '@/src/features/profile/useProfile';
import type { AthleteProfile } from '@/src/features/profile/types';
import { TODAY_QUERY_KEY } from '@/src/features/today/useToday';

import {
  completePlannedWorkout,
  fetchActivityPowerCurve,
  fetchActivityStreamCharts,
  fetchActivitySummary,
  fetchPlannedFuelingPrep,
  fetchPlannedWorkoutDetail,
  fetchRecentActivities,
  fetchUpcomingPlanned,
  requestWorkoutAnalysis,
  skipPlannedWorkout,
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

export function plannedFuelingQueryKey(id: string) {
  return ['activity', 'planned-fueling', id] as const;
}

async function invalidatePlannedCaches(queryClient: QueryClient, id?: string) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: TODAY_QUERY_KEY }),
    queryClient.invalidateQueries({ queryKey: UPCOMING_PLANNED_QUERY_KEY }),
    queryClient.invalidateQueries({ queryKey: RECENT_ACTIVITY_QUERY_KEY }),
    id
      ? queryClient.invalidateQueries({ queryKey: plannedDetailQueryKey(id) })
      : Promise.resolve(),
  ]);
}

export function useRecentActivityQuery() {
  return useQuery({
    queryKey: RECENT_ACTIVITY_QUERY_KEY,
    queryFn: () => fetchRecentActivities(RECENT_ACTIVITY_LIMIT),
  });
}

/** Look back a week so Recently can pair plan-vs-done; Upcoming UI filters to today+. */
const PLANNED_LOOKBACK_DAYS = 7;

export function useUpcomingPlannedQuery() {
  return useQuery({
    queryKey: UPCOMING_PLANNED_QUERY_KEY,
    queryFn: () =>
      fetchUpcomingPlanned({
        limit: UPCOMING_PLANNED_LIMIT,
        windowDays: UPCOMING_WINDOW_DAYS,
        lookbackDays: PLANNED_LOOKBACK_DAYS,
      }),
  });
}

export function useActivitySummaryQuery(id: string | undefined) {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: activityDetailQueryKey(id ?? ''),
    queryFn: () => {
      const profile = queryClient.getQueryData<AthleteProfile>(ATHLETE_PROFILE_KEY);
      return fetchActivitySummary(id!, profile?.distanceUnits ?? 'Kilometers');
    },
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

export function useCompletePlannedWorkout(id: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (options?: { workoutId?: string }) => completePlannedWorkout(id!, options),
    onSuccess: async () => {
      await invalidatePlannedCaches(queryClient, id);
    },
  });
}

export function useSkipPlannedWorkout(id: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => skipPlannedWorkout(id!),
    onSuccess: async () => {
      await invalidatePlannedCaches(queryClient, id);
    },
  });
}

export function usePlannedFuelingQuery(
  id: string | undefined,
  options: { strategy?: string | null; enabled?: boolean } = {}
) {
  return useQuery({
    queryKey: [...plannedFuelingQueryKey(id ?? ''), options.strategy ?? null],
    queryFn: () => fetchPlannedFuelingPrep(id!, options.strategy),
    enabled: Boolean(id) && (options.enabled ?? true),
    staleTime: 60_000,
  });
}
