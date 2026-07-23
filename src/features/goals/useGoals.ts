import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { createGoal, fetchGoals } from './api';
import type { CreateGoalInput, GoalApi } from './types';
import {
  mapGoalDetail,
  mapGoalGlance,
  pickGoalById,
  pickPrimaryGoal,
  sortGoalsForList,
} from './mapGoals';

export const GOALS_LIST_KEY = ['goals', 'list'] as const;

export function useCreateGoalMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateGoalInput) => createGoal(input),
    onSuccess: async (created) => {
      // Seed cache before navigate so goal detail does not flash "not found".
      queryClient.setQueryData<GoalApi[]>(GOALS_LIST_KEY, (prev) => {
        if (!Array.isArray(prev)) return [created];
        if (prev.some((g) => g.id === created.id)) {
          return prev.map((g) => (g.id === created.id ? { ...g, ...created } : g));
        }
        return [created, ...prev];
      });
      await queryClient.invalidateQueries({ queryKey: GOALS_LIST_KEY });
    },
  });
}

export function useGoalsQuery(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: GOALS_LIST_KEY,
    queryFn: fetchGoals,
    enabled: options?.enabled ?? true,
    select: (goals) => sortGoalsForList(goals).map(mapGoalGlance),
  });
}

/** Athlete teaser: coach-wattz primary ordering (priority desc, oldest createdAt). */
export function usePrimaryGoalQuery(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: GOALS_LIST_KEY,
    queryFn: fetchGoals,
    enabled: options?.enabled ?? true,
    select: (goals) => {
      const primary = pickPrimaryGoal(goals);
      return primary ? mapGoalGlance(primary) : null;
    },
  });
}

export function useGoalDetailQuery(id: string | undefined) {
  return useQuery({
    queryKey: GOALS_LIST_KEY,
    queryFn: fetchGoals,
    enabled: Boolean(id),
    select: (goals) => {
      const raw = pickGoalById(goals, id);
      return raw ? mapGoalDetail(raw) : null;
    },
  });
}
