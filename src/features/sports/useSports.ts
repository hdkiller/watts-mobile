import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { ATHLETE_PROFILE_KEY } from '@/src/features/profile/useProfile';

import { fetchSportProfiles, patchSportProfileThresholds } from './api';
import type { SportProfile, SportThresholdPatch } from './types';

export const SPORT_PROFILES_KEY = ['profile', 'sport-settings'] as const;

export function useSportProfilesQuery() {
  return useQuery({
    queryKey: SPORT_PROFILES_KEY,
    queryFn: fetchSportProfiles,
  });
}

export function usePatchSportThresholds() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ profile, patch }: { profile: SportProfile; patch: SportThresholdPatch }) =>
      patchSportProfileThresholds(profile, patch),
    onSuccess: async (profiles) => {
      queryClient.setQueryData(SPORT_PROFILES_KEY, profiles);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: SPORT_PROFILES_KEY }),
        queryClient.invalidateQueries({ queryKey: ATHLETE_PROFILE_KEY }),
        queryClient.invalidateQueries({ queryKey: ['today'] }),
      ]);
    },
  });
}
