import { useQuery } from '@tanstack/react-query';

import { fetchPmc } from './api';
import type { PmcPeriodDays } from './types';

export function pmcQueryKey(days: PmcPeriodDays) {
  return ['performance', 'pmc', days] as const;
}

export function usePmcQuery(days: PmcPeriodDays, enabled = true) {
  return useQuery({
    queryKey: pmcQueryKey(days),
    queryFn: () => fetchPmc(days),
    enabled,
    staleTime: 60_000,
    retry: (count, error) => {
      const status = (error as { status?: number } | null)?.status;
      if (status === 401 || status === 403) return false;
      return count < 2;
    },
  });
}
