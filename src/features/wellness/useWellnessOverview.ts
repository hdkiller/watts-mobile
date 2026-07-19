import { useQuery } from '@tanstack/react-query';

import { fetchWellnessOverview } from './api';

export function wellnessOverviewQueryKey(date: string) {
  return ['wellness', 'overview', date] as const;
}

export function useWellnessOverviewQuery(date: string | null, enabled: boolean) {
  return useQuery({
    queryKey: wellnessOverviewQueryKey(date ?? ''),
    queryFn: () => fetchWellnessOverview(date!),
    enabled: Boolean(enabled && date),
    staleTime: 30_000,
  });
}
