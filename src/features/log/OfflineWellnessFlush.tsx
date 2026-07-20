import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

import { useIsOnline } from '@/src/hooks/useOfflineCached';

import { TODAY_WELLNESS_KEY } from './useLog';
import { flushPendingWellnessCheckin, loadPendingWellnessCheckin } from './offlineWellnessQueue';

/** Flush a queued wellness check-in when connectivity returns. */
export function OfflineWellnessFlush() {
  const isOnline = useIsOnline();
  const queryClient = useQueryClient();
  const flushing = useRef(false);

  useEffect(() => {
    if (!isOnline || flushing.current) return;

    let cancelled = false;
    flushing.current = true;

    void (async () => {
      try {
        const pending = await loadPendingWellnessCheckin();
        if (!pending || cancelled) return;
        const synced = await flushPendingWellnessCheckin();
        if (synced && !cancelled) {
          await queryClient.invalidateQueries({ queryKey: TODAY_WELLNESS_KEY });
        }
      } catch (error) {
        console.warn('Failed to flush offline wellness check-in', error);
      } finally {
        flushing.current = false;
      }
    })();

    return () => {
      cancelled = true;
      flushing.current = false;
    };
  }, [isOnline, queryClient]);

  return null;
}
