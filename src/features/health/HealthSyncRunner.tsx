import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import { useAuth } from '@/src/auth/AuthContext';

import { defineHealthSyncBackgroundTask, registerHealthSyncBackgroundTask } from './backgroundTask';
import { runHealthSyncPass } from './orchestrator';
import { loadHealthSyncPreferences } from './syncPreferences';

defineHealthSyncBackgroundTask();

/**
 * Foreground health sync when authenticated + Sync to Coach Watts enabled.
 * Connect already requests the full read set; this runner only uploads when sync is on.
 */
export function HealthSyncRunner() {
  const { status } = useAuth();
  const lastRun = useRef(0);

  useEffect(() => {
    if (status !== 'authenticated') return;

    const maybeSync = () => {
      void (async () => {
        // Await hydration — the sync snapshot defaults to disabled on cold launch.
        const prefs = await loadHealthSyncPreferences();
        if (!prefs.syncEnabled) return;
        const now = Date.now();
        // Debounce rapid AppState flips
        if (now - lastRun.current < 30_000) return;
        lastRun.current = now;
        await runHealthSyncPass();
      })().catch((err) => {
        console.warn(
          '[HealthSync] foreground pass failed',
          err instanceof Error ? err.message : 'error'
        );
      });
    };

    maybeSync();
    void loadHealthSyncPreferences().then((prefs) => {
      if (prefs.syncEnabled) return registerHealthSyncBackgroundTask();
    });

    const onChange = (next: AppStateStatus) => {
      if (next === 'active') maybeSync();
    };
    const sub = AppState.addEventListener('change', onChange);
    return () => sub.remove();
  }, [status]);

  return null;
}
