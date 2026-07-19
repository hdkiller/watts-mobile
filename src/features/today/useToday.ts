import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { acceptRecommendation, fetchTodayView, generateTodayRecommendation } from './api';

export const TODAY_QUERY_KEY = ['today'] as const;

export function useTodayQuery() {
  return useQuery({
    queryKey: TODAY_QUERY_KEY,
    queryFn: fetchTodayView,
  });
}

export function useAcceptRecommendation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => acceptRecommendation(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: TODAY_QUERY_KEY });
    },
  });
}

export function useGenerateTodayRecommendation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userFeedback?: string) => generateTodayRecommendation(userFeedback),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: TODAY_QUERY_KEY });
    },
  });
}
