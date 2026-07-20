import { useQuery } from '@tanstack/react-query';

import { fetchMonthlyComparison, fetchWorkoutSports } from './api';

export function monthlyComparisonQueryKey(sport: string) {
  return ['stats', 'monthly-comparison', sport] as const;
}

export function useMonthlyComparisonQuery(sport = 'all', enabled = true) {
  return useQuery({
    queryKey: monthlyComparisonQueryKey(sport),
    queryFn: () => fetchMonthlyComparison(sport),
    enabled,
    staleTime: 60_000,
    retry: (count, error) => {
      const status = (error as { status?: number } | null)?.status;
      if (status === 401 || status === 403) return false;
      return count < 2;
    },
  });
}

export function useWorkoutSportsQuery(enabled = true) {
  return useQuery({
    queryKey: ['workouts', 'sports'] as const,
    queryFn: fetchWorkoutSports,
    enabled,
    staleTime: 5 * 60_000,
  });
}
