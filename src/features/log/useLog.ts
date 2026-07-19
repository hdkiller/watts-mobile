import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { fetchTodayWellness, saveWellnessCheckin } from './api';
import type { WellnessUploadPayload } from './types';

export const TODAY_WELLNESS_KEY = ['wellness', 'today'] as const;

export function useTodayWellnessQuery() {
  return useQuery({
    queryKey: TODAY_WELLNESS_KEY,
    queryFn: fetchTodayWellness,
  });
}

export function useSaveWellnessCheckin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: WellnessUploadPayload) => saveWellnessCheckin(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: TODAY_WELLNESS_KEY });
    },
  });
}
