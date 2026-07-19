import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { fetchTodayNutrition, logNutritionItem, quickAddHydration } from './api';
import { localDateYmd } from './mapNutrition';
import type { HydrationQuickAddPayload, NutritionUploadPayload } from './types';

export const TODAY_NUTRITION_KEY = ['nutrition', 'today'] as const;

export function useTodayNutritionQuery() {
  return useQuery({
    queryKey: TODAY_NUTRITION_KEY,
    queryFn: () => fetchTodayNutrition(localDateYmd()),
  });
}

export function useLogNutritionItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: NutritionUploadPayload) => logNutritionItem(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: TODAY_NUTRITION_KEY });
    },
  });
}

export function useQuickAddHydration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: HydrationQuickAddPayload) => quickAddHydration(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: TODAY_NUTRITION_KEY });
    },
  });
}
