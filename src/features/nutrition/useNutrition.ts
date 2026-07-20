import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  fetchNextFuelingWindow,
  fetchTodayNutrition,
  logNutritionItem,
  quickAddHydration,
} from './api';
import { localDateYmd } from './mapNutrition';
import type { HydrationQuickAddPayload, NutritionUploadPayload } from './types';

export const TODAY_NUTRITION_KEY = ['nutrition', 'today'] as const;
export const NEXT_FUELING_WINDOW_KEY = ['nutrition', 'next-window'] as const;

export function useTodayNutritionQuery(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: TODAY_NUTRITION_KEY,
    queryFn: () => fetchTodayNutrition(localDateYmd()),
    enabled: options?.enabled ?? true,
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

export function useNextFuelingWindowQuery(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: NEXT_FUELING_WINDOW_KEY,
    queryFn: fetchNextFuelingWindow,
    enabled: options?.enabled ?? true,
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
