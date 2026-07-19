import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createJourneyEvent,
  deleteJourneyEvent,
  fetchActiveRecoveryToday,
  updateJourneyEvent,
} from './api';
import type { JourneyEventPayload } from './types';

export const ACTIVE_RECOVERY_KEY = ['recovery-context', 'active-today'] as const;

export function useActiveRecoveryQuery() {
  return useQuery({
    queryKey: ACTIVE_RECOVERY_KEY,
    queryFn: () => fetchActiveRecoveryToday(7),
  });
}

export function useCreateJourneyEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: JourneyEventPayload) => createJourneyEvent(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ACTIVE_RECOVERY_KEY });
    },
  });
}

export function useUpdateJourneyEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: JourneyEventPayload }) =>
      updateJourneyEvent(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ACTIVE_RECOVERY_KEY });
    },
  });
}

export function useDeleteJourneyEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteJourneyEvent(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ACTIVE_RECOVERY_KEY });
    },
  });
}
