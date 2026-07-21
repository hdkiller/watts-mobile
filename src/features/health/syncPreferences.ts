import AsyncStorage from '@react-native-async-storage/async-storage';

import type { HealthSyncPreferences } from './types';

const STORAGE_KEY = 'watts.health.syncPreferences.v1';

const DEFAULTS: HealthSyncPreferences = {
  syncEnabled: false,
  syncWorkouts: true,
  workoutsDefaultApplied: false,
};

let memory: HealthSyncPreferences = { ...DEFAULTS };
let hydrated = false;
const listeners = new Set<() => void>();

function notify() {
  for (const listener of listeners) listener();
}

function parsePreferences(raw: string | null): HealthSyncPreferences {
  if (!raw) return { ...DEFAULTS };
  try {
    const parsed = JSON.parse(raw) as Partial<HealthSyncPreferences>;
    return {
      syncEnabled: parsed.syncEnabled === true,
      syncWorkouts: parsed.syncWorkouts !== false,
      lastSuccessAt:
        typeof parsed.lastSuccessAt === 'string' ? parsed.lastSuccessAt : undefined,
      workoutsDefaultApplied: parsed.workoutsDefaultApplied === true,
    };
  } catch {
    return { ...DEFAULTS };
  }
}

let hydrationPromise: Promise<void> | null = null;

async function ensureHydrated(): Promise<void> {
  if (hydrated) return;
  if (!hydrationPromise) {
    hydrationPromise = (async () => {
      const previous = memory;
      let next: HealthSyncPreferences;
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        next = parsePreferences(raw);
      } catch {
        next = { ...DEFAULTS };
      }
      // A write (persist/clear) that landed while we were reading wins.
      if (hydrated) return;
      memory = next;
      hydrated = true;
      if (JSON.stringify(memory) !== JSON.stringify(previous)) notify();
    })().finally(() => {
      hydrationPromise = null;
    });
  }
  return hydrationPromise;
}

export async function loadHealthSyncPreferences(): Promise<HealthSyncPreferences> {
  await ensureHydrated();
  return memory;
}

/** Stable snapshot for useSyncExternalStore — must not allocate a new object each call. */
export function getHealthSyncPreferencesSync(): HealthSyncPreferences {
  return memory;
}

export function isHealthSyncPreferencesHydrated(): boolean {
  return hydrated;
}

export function subscribeHealthSyncPreferences(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

async function persist(next: HealthSyncPreferences): Promise<void> {
  memory = next;
  notify();
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

/** Enable/disable master wellness sync. First enable defaults workouts ON. */
export async function setHealthSyncEnabled(enabled: boolean): Promise<HealthSyncPreferences> {
  await ensureHydrated();
  const next: HealthSyncPreferences = {
    ...memory,
    syncEnabled: enabled,
  };
  if (enabled && !memory.workoutsDefaultApplied) {
    next.syncWorkouts = true;
    next.workoutsDefaultApplied = true;
  }
  await persist(next);
  return { ...next };
}

export async function setHealthSyncWorkouts(enabled: boolean): Promise<HealthSyncPreferences> {
  await ensureHydrated();
  const next: HealthSyncPreferences = {
    ...memory,
    syncWorkouts: enabled,
    workoutsDefaultApplied: true,
  };
  await persist(next);
  return { ...next };
}

export async function markHealthSyncSuccess(at: string = new Date().toISOString()): Promise<void> {
  await ensureHydrated();
  await persist({ ...memory, lastSuccessAt: at });
}

export async function clearHealthSyncPreferences(): Promise<void> {
  memory = { ...DEFAULTS };
  hydrated = true;
  notify();
  await AsyncStorage.removeItem(STORAGE_KEY);
}

/** Test helper */
export function _resetHealthSyncPreferencesForTests(): void {
  memory = { ...DEFAULTS };
  hydrated = false;
  hydrationPromise = null;
  listeners.clear();
}
