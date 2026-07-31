import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';

import { fetchPlannedForActivityGlance } from '@/src/features/activity/api';
import { UPCOMING_PLANNED_QUERY_KEY } from '@/src/features/activity/useActivity';
import { TODAY_QUERY_KEY } from '@/src/features/today/useToday';

import {
  abandonPlan,
  adaptPlan,
  createPlanBlock,
  createPlannedWorkout,
  deletePlanBlock,
  deletePlannedWorkout,
  fetchActivePlan,
  generateAiWeek,
  generateTrainingBlock,
  generateWeekStructures,
  generateWorkoutStructure,
  movePlannedWorkout,
  patchPlanBlock,
  patchPlanWeek,
  patchPlannedWorkout,
  reorderPlanBlocks,
  replanStructure,
  type PlannedWorkoutPatchInput,
  type PlannedWorkoutWriteInput,
} from './api';
import { mapActivePlanShell } from './mapActivePlan';
import type {
  BlockCreateInput,
  BlockPatchInput,
  PlanAdaptationType,
  ReplanBlockInput,
  WeekTuneInput,
} from './types';

export const ACTIVE_PLAN_QUERY_KEY = ['plans', 'active'] as const;
export const PLAN_WEEK_SESSIONS_QUERY_KEY = ['plans', 'week-sessions'] as const;

export async function invalidatePlanCaches(
  queryClient: QueryClient,
  options: { plannedId?: string } = {},
) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ACTIVE_PLAN_QUERY_KEY }),
    queryClient.invalidateQueries({ queryKey: PLAN_WEEK_SESSIONS_QUERY_KEY }),
    queryClient.invalidateQueries({ queryKey: UPCOMING_PLANNED_QUERY_KEY }),
    queryClient.invalidateQueries({ queryKey: TODAY_QUERY_KEY }),
    options.plannedId
      ? queryClient.invalidateQueries({ queryKey: ['activity', 'planned', options.plannedId] })
      : Promise.resolve(),
  ]);
}

/** Planned sessions for a plan week range (past or future) — not Today’s upcoming window. */
export function usePlanWeekSessionsQuery(
  startDateKey: string | null | undefined,
  endDateKey: string | null | undefined,
) {
  const startKey = startDateKey ?? null;
  const endKey = endDateKey ?? startKey;
  return useQuery({
    queryKey: [...PLAN_WEEK_SESSIONS_QUERY_KEY, startKey, endKey] as const,
    enabled: Boolean(startKey),
    queryFn: () => {
      const start = new Date(`${startKey}T00:00:00`);
      const end = new Date(`${endKey}T23:59:59.999`);
      return fetchPlannedForActivityGlance(start, end);
    },
  });
}

export function useActivePlanQuery(options: { hasUsableData?: boolean } = {}) {
  return useQuery({
    queryKey: ACTIVE_PLAN_QUERY_KEY,
    queryFn: fetchActivePlan,
    select: (data) => ({
      raw: data,
      shell: mapActivePlanShell(data.plan, { hasUsableData: options.hasUsableData }),
    }),
  });
}

export function useAdaptPlanMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      planId,
      adaptationType,
      signal,
    }: {
      planId: string;
      adaptationType: PlanAdaptationType;
      signal?: AbortSignal;
    }) => adaptPlan(planId, adaptationType, { signal }),
    onSuccess: async () => {
      await invalidatePlanCaches(queryClient);
    },
  });
}

export function useAbandonPlanMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (planId: string) => abandonPlan(planId),
    onSuccess: async () => {
      await invalidatePlanCaches(queryClient);
    },
  });
}

export function useReplanStructureMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ planId, blocks }: { planId: string; blocks: ReplanBlockInput[] }) =>
      replanStructure(planId, blocks),
    onSuccess: async () => {
      await invalidatePlanCaches(queryClient);
    },
  });
}

export function usePatchWeekMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ weekId, input }: { weekId: string; input: WeekTuneInput }) =>
      patchPlanWeek(weekId, input),
    onSuccess: async () => {
      await invalidatePlanCaches(queryClient);
    },
  });
}

export function useMovePlannedMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, date }: { id: string; date: string }) => movePlannedWorkout(id, date),
    onSuccess: async (_data, vars) => {
      await invalidatePlanCaches(queryClient, { plannedId: vars.id });
    },
  });
}

export function useCreatePlannedWorkoutMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: PlannedWorkoutWriteInput) => createPlannedWorkout(input),
    onSuccess: async () => {
      await invalidatePlanCaches(queryClient);
    },
  });
}

export function usePatchPlannedWorkoutMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: PlannedWorkoutPatchInput }) =>
      patchPlannedWorkout(id, input),
    onSuccess: async (_data, vars) => {
      await invalidatePlanCaches(queryClient, { plannedId: vars.id });
    },
  });
}

export function useDeletePlannedWorkoutMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePlannedWorkout(id),
    onSuccess: async (_data, id) => {
      await invalidatePlanCaches(queryClient, { plannedId: id });
    },
  });
}

export function useGenerateStructureMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      plannedWorkoutId,
      signal,
    }: {
      plannedWorkoutId: string;
      signal?: AbortSignal;
    }) => generateWorkoutStructure(plannedWorkoutId, { signal }),
    onSuccess: async (_data, vars) => {
      await invalidatePlanCaches(queryClient, { plannedId: vars.plannedWorkoutId });
    },
  });
}

export function useGenerateWeekStructuresMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      ids,
      onProgress,
      signal,
    }: {
      ids: string[];
      onProgress?: (done: number, total: number) => void;
      signal?: AbortSignal;
    }) => generateWeekStructures(ids, onProgress, { signal }),
    // Partial batch success still needs a refresh even when the mutation throws.
    onSettled: async () => {
      await invalidatePlanCaches(queryClient);
    },
  });
}

export function useGenerateAiWeekMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      blockId,
      weekId,
      instructions,
      signal,
    }: {
      blockId: string;
      weekId: string;
      instructions?: string;
      signal?: AbortSignal;
    }) => generateAiWeek(blockId, weekId, instructions, { signal }),
    onSuccess: async () => {
      await invalidatePlanCaches(queryClient);
    },
  });
}

export function useGenerateBlockMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ blockId, signal }: { blockId: string; signal?: AbortSignal }) =>
      generateTrainingBlock(blockId, { signal }),
    onSuccess: async () => {
      await invalidatePlanCaches(queryClient);
    },
  });
}

export function useBlockMutations() {
  const queryClient = useQueryClient();
  const invalidate = async () => invalidatePlanCaches(queryClient);

  const create = useMutation({
    mutationFn: ({ planId, input }: { planId: string; input: BlockCreateInput }) =>
      createPlanBlock(planId, input),
    onSuccess: invalidate,
  });
  const patch = useMutation({
    mutationFn: ({
      planId,
      blockId,
      input,
    }: {
      planId: string;
      blockId: string;
      input: BlockPatchInput;
    }) => patchPlanBlock(planId, blockId, input),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: ({ planId, blockId }: { planId: string; blockId: string }) =>
      deletePlanBlock(planId, blockId),
    onSuccess: invalidate,
  });
  const reorder = useMutation({
    mutationFn: ({ planId, blocks }: { planId: string; blocks: { id: string; order: number }[] }) =>
      reorderPlanBlocks(planId, blocks),
    onSuccess: invalidate,
  });

  return { create, patch, remove, reorder };
}
