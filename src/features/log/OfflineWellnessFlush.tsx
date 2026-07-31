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
      // Do NOT reset flushing.current here: the async flush above may still
      // be in flight (POST + clear-if-unchanged). Resetting the guard on
      // effect cleanup (e.g. isOnline flapping or queryClient identity
      // change) would let a second overlapping flush start and race with
      // the first. The guard is only cleared in the `finally` below, once
      // the in-flight flush has actually completed.
    };
  }, [isOnline, queryClient]);

  return null;
}
