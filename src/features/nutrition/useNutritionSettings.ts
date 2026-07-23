import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { ATHLETE_PROFILE_KEY } from '@/src/features/profile/useProfile';

import { fetchNutritionSettings, saveNutritionSettings } from './nutritionSettingsApi';
import type { NutritionSettingsPayload } from './nutritionSettingsTypes';

export const NUTRITION_SETTINGS_KEY = ['nutrition', 'settings'] as const;

export function useNutritionSettingsQuery(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: NUTRITION_SETTINGS_KEY,
    queryFn: fetchNutritionSettings,
    enabled: options?.enabled ?? true,
  });
}

export function useSaveNutritionSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: NutritionSettingsPayload) => saveNutritionSettings(payload),
    onSuccess: async (settings) => {
      queryClient.setQueryData(NUTRITION_SETTINGS_KEY, settings);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: NUTRITION_SETTINGS_KEY }),
        queryClient.invalidateQueries({ queryKey: ['nutrition'] }),
        queryClient.invalidateQueries({ queryKey: ATHLETE_PROFILE_KEY }),
        queryClient.invalidateQueries({ queryKey: ['today'] }),
      ]);
    },
  });
}
