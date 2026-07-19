import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  fetchTodayDailyCheckin,
  generateDailyCheckin,
  submitDailyCheckinAnswers,
} from './dailyCheckinApi';

export const DAILY_CHECKIN_QUERY_KEY = ['log', 'dailyCheckin', 'today'] as const;

export function useDailyCheckinQuery() {
  return useQuery({
    queryKey: DAILY_CHECKIN_QUERY_KEY,
    queryFn: fetchTodayDailyCheckin,
    staleTime: 30_000,
  });
}

export function useGenerateDailyCheckin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (force?: boolean) => generateDailyCheckin(force),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: DAILY_CHECKIN_QUERY_KEY });
    },
  });
}

export function useSubmitDailyCheckin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      checkinId,
      answers,
      userNotes,
    }: {
      checkinId: string;
      answers: Record<string, 'YES' | 'NO'>;
      userNotes?: string;
    }) => submitDailyCheckinAnswers(checkinId, answers, userNotes),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: DAILY_CHECKIN_QUERY_KEY });
    },
  });
}
