import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  fetchAiSettingsLite,
  fetchAthleteProfile,
  isAiSettingsBearerAvailable,
  patchAiSettingsLite,
  patchAthleteMetrics,
  patchCoachIdentityProfile,
  patchUnitsLocale,
} from './api';
import type {
  AiSettingsLitePatch,
  AthleteMetricsPatch,
  CoachIdentityProfilePatch,
  UnitsLocalePatch,
} from './types';

export const ATHLETE_PROFILE_KEY = ['profile', 'athlete'] as const;
export const AI_SETTINGS_LITE_KEY = ['settings', 'ai', 'lite'] as const;
export const AI_SETTINGS_AVAILABLE_KEY = ['settings', 'ai', 'available'] as const;

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

export function usePatchUnitsLocale() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (patch: UnitsLocalePatch) => patchUnitsLocale(patch),
    onSuccess: async (profile) => {
      queryClient.setQueryData(ATHLETE_PROFILE_KEY, profile);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ATHLETE_PROFILE_KEY }),
        queryClient.invalidateQueries({ queryKey: ['activity'] }),
        queryClient.invalidateQueries({ queryKey: ['today'] }),
        queryClient.invalidateQueries({ queryKey: ['nutrition'] }),
      ]);
    },
  });
}

export function useAiSettingsAvailableQuery() {
  return useQuery({
    queryKey: AI_SETTINGS_AVAILABLE_KEY,
    queryFn: isAiSettingsBearerAvailable,
    staleTime: 60_000,
  });
}

export function useAiSettingsLiteQuery(enabled = true) {
  return useQuery({
    queryKey: AI_SETTINGS_LITE_KEY,
    queryFn: fetchAiSettingsLite,
    enabled,
  });
}

export function usePatchCoachIdentity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      profile: CoachIdentityProfilePatch;
      ai?: AiSettingsLitePatch;
      aiAvailable: boolean;
    }) => {
      const profile = await patchCoachIdentityProfile(input.profile);
      let ai = null;
      if (input.aiAvailable && input.ai && Object.keys(input.ai).length > 0) {
        ai = await patchAiSettingsLite(input.ai);
      }
      return { profile, ai };
    },
    onSuccess: async ({ profile, ai }) => {
      queryClient.setQueryData(ATHLETE_PROFILE_KEY, profile);
      if (ai) {
        queryClient.setQueryData(AI_SETTINGS_LITE_KEY, ai);
      }
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ATHLETE_PROFILE_KEY }),
        queryClient.invalidateQueries({ queryKey: AI_SETTINGS_LITE_KEY }),
      ]);
    },
  });
}
