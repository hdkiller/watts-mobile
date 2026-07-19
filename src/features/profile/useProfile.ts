import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { fetchAthleteProfile, patchAthleteMetrics } from './api';
import type { AthleteMetricsPatch } from './types';

export const ATHLETE_PROFILE_KEY = ['profile', 'athlete'] as const;

export function useAthleteProfileQuery() {
  return useQuery({
    queryKey: ATHLETE_PROFILE_KEY,
    queryFn: fetchAthleteProfile,
  });
}

export function usePatchAthleteMetrics() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (patch: AthleteMetricsPatch) => patchAthleteMetrics(patch),
    onSuccess: async (profile) => {
      queryClient.setQueryData(ATHLETE_PROFILE_KEY, profile);
      await queryClient.invalidateQueries({ queryKey: ATHLETE_PROFILE_KEY });
    },
  });
}
