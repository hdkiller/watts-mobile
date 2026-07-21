import { Platform } from 'react-native';

import { HEALTHKIT_BACKGROUND_DELIVERY_TYPES } from './syncPermissions';

export const HEALTH_SYNC_TASK = 'COACH_WATTS_HEALTH_SYNC';

const HC_CHANGES_TOKEN_KEY = 'watts.health.hcChangesToken.v1';

let defined = false;
let hkObserverRemovers: { remove: () => boolean }[] = [];
let hcChangesPollTimer: ReturnType<typeof setInterval> | null = null;

/**
 * Define the background task once at module load (global scope requirement).
 * Safe no-op when native modules are unavailable (web / Expo Go).
 */
export function defineHealthSyncBackgroundTask(): void {
  if (defined) return;
  defined = true;
  if (Platform.OS === 'web') return;

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const TaskManager = require('expo-task-manager') as typeof import('expo-task-manager');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const BackgroundTask = require('expo-background-task') as typeof import('expo-background-task');

    TaskManager.defineTask(HEALTH_SYNC_TASK, async () => {
      try {
        const { loadHealthSyncPreferences } = await import('./syncPreferences');
        const prefs = await loadHealthSyncPreferences();
        if (!prefs.syncEnabled) {
          return BackgroundTask.BackgroundTaskResult.Success;
        }
        // Drain Health Connect change token when available (Android).
        if (Platform.OS === 'android') {
          await drainHealthConnectChanges();
        }
        const { runHealthSyncPass } = await import('./orchestrator');
        const result = await runHealthSyncPass();
        if (
          result.wellnessFailed > 0 ||
          result.workoutsFailed > 0 ||
          result.wellnessPassError ||
          result.workoutPassError
        ) {
          return BackgroundTask.BackgroundTaskResult.Failed;
        }
        return BackgroundTask.BackgroundTaskResult.Success;
      } catch (err) {
        console.warn(
          '[HealthSync] background task failed',
          err instanceof Error ? err.message : 'error'
        );
        return BackgroundTask.BackgroundTaskResult.Failed;
      }
    });
  } catch {
    // Native module missing until rebuild — foreground sync still works.
  }
}

async function drainHealthConnectChanges(): Promise<boolean> {
  try {
    const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
    const HC = await import('react-native-health-connect');
    const status = await HC.getSdkStatus();
    if (status !== 3) return false;
    await HC.initialize();

    const token = await AsyncStorage.getItem(HC_CHANGES_TOKEN_KEY);
    const result = await HC.getChanges({
      ...(token ? { changesToken: token } : {}),
      recordTypes: [
        'SleepSession',
        'Steps',
        'Distance',
        'HeartRate',
        'RestingHeartRate',
        'HeartRateVariabilityRmssd',
        'ExerciseSession',
        'Weight',
        'BodyFat',
        'OxygenSaturation',
        'RespiratoryRate',
        'Vo2Max',
        'ActiveCaloriesBurned',
        'TotalCaloriesBurned',
        'BasalMetabolicRate',
        'FloorsClimbed',
        'Power',
        'Speed',
        'CyclingPedalingCadence',
        'StepsCadence',
      ],
    });
    if (result.nextChangesToken) {
      await AsyncStorage.setItem(HC_CHANGES_TOKEN_KEY, result.nextChangesToken);
    }
    if (result.changesTokenExpired) {
      await AsyncStorage.removeItem(HC_CHANGES_TOKEN_KEY);
    }
    return (
      (result.upsertionChanges?.length ?? 0) > 0 || (result.deletionChanges?.length ?? 0) > 0
    );
  } catch (err) {
    console.warn(
      '[HealthSync] HC getChanges failed',
      err instanceof Error ? err.message : 'error'
    );
    return false;
  }
}

async function registerHealthKitBackgroundDelivery(): Promise<void> {
  if (Platform.OS !== 'ios') return;
  try {
    const HK = await import('@kingstinct/react-native-healthkit');
    const available = await HK.isHealthDataAvailable();
    if (!available) return;

    // Prefer bulk configure when available; fall back per-type enable.
    try {
      await HK.configureBackgroundTypes(
        [...HEALTHKIT_BACKGROUND_DELIVERY_TYPES] as never,
        HK.UpdateFrequency.hourly
      );
    } catch {
      for (const typeId of HEALTHKIT_BACKGROUND_DELIVERY_TYPES) {
        try {
          await HK.enableBackgroundDelivery(typeId as never, HK.UpdateFrequency.hourly);
        } catch {
          // type unavailable on this OS — skip
        }
      }
    }

    // Foreground/observer wake: coalesce into a sync pass.
    for (const remover of hkObserverRemovers) {
      try {
        remover.remove();
      } catch {
        // ignore
      }
    }
    hkObserverRemovers = [];

    let coalesceTimer: ReturnType<typeof setTimeout> | null = null;
    const schedulePass = () => {
      if (coalesceTimer) clearTimeout(coalesceTimer);
      coalesceTimer = setTimeout(() => {
        void import('./orchestrator').then(({ runHealthSyncPass }) => {
          void runHealthSyncPass();
        });
      }, 5000);
    };

    for (const typeId of HEALTHKIT_BACKGROUND_DELIVERY_TYPES) {
      try {
        const sub = HK.subscribeToChanges(typeId as never, () => {
          schedulePass();
        });
        hkObserverRemovers.push(sub);
      } catch {
        // ignore unavailable types
      }
    }
  } catch (err) {
    console.warn(
      '[HealthSync] HK background delivery unavailable — foreground sync still works',
      err instanceof Error ? err.message : 'error'
    );
  }
}

async function unregisterHealthKitBackgroundDelivery(): Promise<void> {
  if (Platform.OS !== 'ios') return;
  for (const remover of hkObserverRemovers) {
    try {
      remover.remove();
    } catch {
      // ignore
    }
  }
  hkObserverRemovers = [];
  try {
    const HK = await import('@kingstinct/react-native-healthkit');
    await HK.disableAllBackgroundDelivery();
    try {
      await HK.clearBackgroundTypes();
    } catch {
      // optional API
    }
  } catch {
    // ignore
  }
}

async function registerHealthConnectChangePolling(): Promise<void> {
  if (Platform.OS !== 'android') return;
  // Prime the changes token so subsequent BG wakes see a delta.
  await drainHealthConnectChanges();
  if (hcChangesPollTimer) clearInterval(hcChangesPollTimer);
  // Foreground coalesce while app is open (WorkManager / BG task covers background).
  hcChangesPollTimer = setInterval(() => {
    void (async () => {
      const changed = await drainHealthConnectChanges();
      if (!changed) return;
      const { loadHealthSyncPreferences } = await import('./syncPreferences');
      const prefs = await loadHealthSyncPreferences();
      if (!prefs.syncEnabled) return;
      const { runHealthSyncPass } = await import('./orchestrator');
      await runHealthSyncPass();
    })();
  }, 15 * 60 * 1000);
}

async function unregisterHealthConnectChangePolling(): Promise<void> {
  if (hcChangesPollTimer) {
    clearInterval(hcChangesPollTimer);
    hcChangesPollTimer = null;
  }
  try {
    const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
    await AsyncStorage.removeItem(HC_CHANGES_TOKEN_KEY);
  } catch {
    // ignore
  }
}

export async function registerHealthSyncBackgroundTask(): Promise<void> {
  if (Platform.OS === 'web') return;
  defineHealthSyncBackgroundTask();
  try {
    const BackgroundTask = await import('expo-background-task');
    const TaskManager = await import('expo-task-manager');
    const available = await TaskManager.isAvailableAsync();
    if (available) {
      const isRegistered = await TaskManager.isTaskRegisteredAsync(HEALTH_SYNC_TASK);
      if (!isRegistered) {
        await BackgroundTask.registerTaskAsync(HEALTH_SYNC_TASK, {
          minimumInterval: 15, // minutes (OS may batch longer)
        });
      }
    }
  } catch (err) {
    console.warn(
      '[HealthSync] background register failed — degrading to foreground-only',
      err instanceof Error ? err.message : 'error'
    );
  }

  // Change-driven triggers (best-effort; failures degrade to periodic/foreground).
  try {
    if (Platform.OS === 'ios') {
      await registerHealthKitBackgroundDelivery();
    } else if (Platform.OS === 'android') {
      await registerHealthConnectChangePolling();
    }
  } catch (err) {
    console.warn(
      '[HealthSync] change-driven register failed',
      err instanceof Error ? err.message : 'error'
    );
  }
}

export async function unregisterHealthSyncBackgroundTask(): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    await unregisterHealthKitBackgroundDelivery();
    await unregisterHealthConnectChangePolling();
  } catch {
    // ignore
  }
  try {
    const TaskManager = await import('expo-task-manager');
    const available = await TaskManager.isAvailableAsync();
    if (!available) return;
    const isRegistered = await TaskManager.isTaskRegisteredAsync(HEALTH_SYNC_TASK);
    if (isRegistered) {
      const BackgroundTask = await import('expo-background-task');
      await BackgroundTask.unregisterTaskAsync(HEALTH_SYNC_TASK);
    }
  } catch (err) {
    console.warn(
      '[HealthSync] background unregister failed',
      err instanceof Error ? err.message : 'error'
    );
  }
}
