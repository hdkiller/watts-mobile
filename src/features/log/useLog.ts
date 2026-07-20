import { onlineManager, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { fetchTodayWellness, saveWellnessCheckin } from './api';
import { enqueueWellnessCheckin } from './offlineWellnessQueue';
import type { WellnessUploadPayload } from './types';

export const TODAY_WELLNESS_KEY = ['wellness', 'today'] as const;

export type SaveWellnessResult = {
  /** True when the payload was queued locally and will sync on reconnect. */
  queuedOffline: boolean;
};

export function useTodayWellnessQuery() {
  return useQuery({
    queryKey: TODAY_WELLNESS_KEY,
    queryFn: fetchTodayWellness,
  });
}

export function useSaveWellnessCheckin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: WellnessUploadPayload): Promise<SaveWellnessResult> => {
      if (!onlineManager.isOnline()) {
        await enqueueWellnessCheckin(payload);
        return { queuedOffline: true };
      }
      try {
        await saveWellnessCheckin(payload);
        return { queuedOffline: false };
      } catch (err) {
        // Network blip with a still-"online" manager — queue instead of losing the field check-in.
        const message = err instanceof Error ? err.message.toLowerCase() : '';
        const looksNetwork =
          message.includes('network') ||
          message.includes('offline') ||
          message.includes('failed to fetch') ||
          (typeof err === 'object' &&
            err !== null &&
            'status' in err &&
            (err as { status?: number }).status === 0);
        if (looksNetwork) {
          await enqueueWellnessCheckin(payload);
          return { queuedOffline: true };
        }
        throw err;
      }
    },
    onSuccess: async (result) => {
      if (!result.queuedOffline) {
        await queryClient.invalidateQueries({ queryKey: TODAY_WELLNESS_KEY });
      }
    },
  });
}
