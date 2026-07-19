import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createJourneyEvent,
  deleteJourneyEvent,
  fetchRecoveryContext,
  updateJourneyEvent,
} from './api';
import { filterActiveToday } from './mapRecovery';
import type { JourneyEventPayload } from './types';

/** Shared cache for GET /api/recovery-context (unfiltered window). */
export const RECOVERY_CONTEXT_KEY = ['recovery-context', 7] as const;

export function useRecoveryContextQuery(days = 7) {
  return useQuery({
    queryKey: ['recovery-context', days] as const,
    queryFn: () => fetchRecoveryContext(days),
  });
}

/** Active-today subset derived from the shared recovery-context cache. */
export function useActiveRecoveryQuery() {
  const query = useRecoveryContextQuery(7);
  return {
    ...query,
    data: query.data !== undefined ? filterActiveToday(query.data) : undefined,
  };
}

async function invalidateRecoveryContext(queryClient: ReturnType<typeof useQueryClient>) {
  await queryClient.invalidateQueries({ queryKey: ['recovery-context'] });
}

export function useCreateJourneyEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: JourneyEventPayload) => createJourneyEvent(payload),
    onSuccess: async () => {
      await invalidateRecoveryContext(queryClient);
    },
  });
}

export function useUpdateJourneyEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: JourneyEventPayload }) =>
      updateJourneyEvent(id, payload),
    onSuccess: async () => {
      await invalidateRecoveryContext(queryClient);
    },
  });
}

export function useDeleteJourneyEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteJourneyEvent(id),
    onSuccess: async () => {
      await invalidateRecoveryContext(queryClient);
    },
  });
}
