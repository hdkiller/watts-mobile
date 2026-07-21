import { useCallback, useEffect, useSyncExternalStore } from 'react';

import {
  getHealthSyncPreferencesSync,
  isHealthSyncPreferencesHydrated,
  loadHealthSyncPreferences,
  setHealthSyncEnabled,
  setHealthSyncWorkouts,
  subscribeHealthSyncPreferences,
} from './syncPreferences';
import type { HealthSyncPreferences } from './types';
import {
  registerHealthSyncBackgroundTask,
  unregisterHealthSyncBackgroundTask,
} from './backgroundTask';
import { requestHealthSyncPermissions } from './syncPermissions';
import { runHealthSyncPass } from './orchestrator';

export function useHealthSyncPreferences() {
  const prefs = useSyncExternalStore(
    subscribeHealthSyncPreferences,
    getHealthSyncPreferencesSync,
    getHealthSyncPreferencesSync
  );

  useEffect(() => {
    if (!isHealthSyncPreferencesHydrated()) {
      void loadHealthSyncPreferences();
    }
  }, []);

  const setEnabled = useCallback(async (enabled: boolean) => {
    if (enabled) {
      const granted = await requestHealthSyncPermissions();
      if (!granted) {
        throw new Error('Health permissions are required to enable sync');
      }
      const next = await setHealthSyncEnabled(true);
      await registerHealthSyncBackgroundTask();
      void runHealthSyncPass();
      return next;
    }
    const next = await setHealthSyncEnabled(false);
    await unregisterHealthSyncBackgroundTask();
    return next;
  }, []);

  const setWorkouts = useCallback(async (enabled: boolean) => {
    if (enabled) {
      const granted = await requestHealthSyncPermissions();
      if (!granted) {
        throw new Error('Workout health permissions are required to enable workout sync');
      }
    }
    const next = await setHealthSyncWorkouts(enabled);
    if (next.syncEnabled && enabled) {
      void runHealthSyncPass();
    }
    return next;
  }, []);

  return {
    preferences: prefs as HealthSyncPreferences,
    setEnabled,
    setWorkouts,
    hydrated: isHealthSyncPreferencesHydrated(),
  };
}
