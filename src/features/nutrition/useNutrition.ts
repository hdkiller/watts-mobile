import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  fetchLoggedNutritionDateKeys,
  fetchNextFuelingWindow,
  fetchNutritionGrocery,
  fetchNutritionPlan,
  fetchTodayNutrition,
  generateNutritionPlanDraft,
  logNutritionItem,
  patchNutritionPlanMeal,
  quickAddHydration,
  regenerateDayFuelingPlan,
  type NutritionMealAction,
} from './api';
import { localDateYmd } from './mapNutrition';
import type { HydrationQuickAddPayload, NutritionUploadPayload } from './types';

export const TODAY_NUTRITION_KEY = ['nutrition', 'today'] as const;
export const NEXT_FUELING_WINDOW_KEY = ['nutrition', 'next-window'] as const;
export const NUTRITION_GLANCE_KEY = ['nutrition', 'glance', 'logged-days'] as const;

export function useTodayNutritionQuery(
  dateOrOptions?: string | { enabled?: boolean },
  options?: { enabled?: boolean }
) {
  const date = typeof dateOrOptions === 'string' ? dateOrOptions : localDateYmd();
  const opts = typeof dateOrOptions === 'object' ? dateOrOptions : options;
  return useQuery({
    queryKey: ['nutrition', 'day', date],
    queryFn: () => fetchTodayNutrition(date),
    enabled: opts?.enabled ?? true,
  });
}

export function useLogNutritionItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: NutritionUploadPayload) => logNutritionItem(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['nutrition'] });
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
      await queryClient.invalidateQueries({ queryKey: ['nutrition'] });
    },
  });
}

export function useNutritionGlanceLoggedDaysQuery(
  startYmd: string,
  endYmd: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: [...NUTRITION_GLANCE_KEY, startYmd, endYmd] as const,
    queryFn: () => fetchLoggedNutritionDateKeys(startYmd, endYmd),
    enabled: options?.enabled ?? true,
    staleTime: 60_000,
  });
}

export const NUTRITION_PLAN_KEY = ['nutrition', 'plan'] as const;
export const NUTRITION_GROCERY_KEY = ['nutrition', 'grocery'] as const;

export function useNutritionPlanQuery(
  start: string,
  end: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: [...NUTRITION_PLAN_KEY, start, end] as const,
    queryFn: () => fetchNutritionPlan(start, end),
    enabled: options?.enabled ?? true,
  });
}

export function useNutritionGroceryQuery(
  start: string,
  end: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: [...NUTRITION_GROCERY_KEY, start, end] as const,
    queryFn: () => fetchNutritionGrocery(start, end),
    enabled: options?.enabled ?? true,
  });
}

export function useGenerateNutritionPlanDraft() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ startDate, endDate }: { startDate: string; endDate: string }) =>
      generateNutritionPlanDraft(startDate, endDate),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: NUTRITION_PLAN_KEY });
      await queryClient.invalidateQueries({ queryKey: NUTRITION_GROCERY_KEY });
    },
  });
}

export function useRegenerateDayFuelingPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (date: string) => regenerateDayFuelingPlan(date),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: NUTRITION_PLAN_KEY });
    },
  });
}

export function usePatchNutritionPlanMeal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      mealId,
      action,
      meal,
    }: {
      mealId: string;
      action: NutritionMealAction;
      meal?: unknown;
    }) => patchNutritionPlanMeal(mealId, action, meal),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: NUTRITION_PLAN_KEY });
      await queryClient.invalidateQueries({ queryKey: NUTRITION_GROCERY_KEY });
    },
  });
}
