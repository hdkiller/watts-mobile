import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  _resetHealthSyncPreferencesForTests,
  clearHealthSyncPreferences,
  getHealthSyncPreferencesSync,
  isHealthSyncPreferencesHydrated,
  loadHealthSyncPreferences,
  markHealthSyncSuccess,
  setHealthSyncEnabled,
  setHealthSyncWorkouts,
  subscribeHealthSyncPreferences,
} from '../syncPreferences';

vi.mock('@react-native-async-storage/async-storage', () => {
  const store = new Map<string, string>();
  return {
    default: {
      getItem: vi.fn(async (key: string) => store.get(key) ?? null),
      setItem: vi.fn(async (key: string, value: string) => {
        store.set(key, value);
      }),
      removeItem: vi.fn(async (key: string) => {
        store.delete(key);
      }),
    },
  };
});

describe('syncPreferences', () => {
  beforeEach(() => {
    _resetHealthSyncPreferencesForTests();
    vi.clearAllMocks();
  });

  it('loads default preferences when uninitialized', async () => {
    const prefs = await loadHealthSyncPreferences();
    expect(prefs.syncEnabled).toBe(false);
    expect(prefs.syncWorkouts).toBe(true);
    expect(prefs.workoutsDefaultApplied).toBe(false);
    expect(isHealthSyncPreferencesHydrated()).toBe(true);
  });

  it('enables master sync and sets syncWorkouts true on first enable', async () => {
    const listener = vi.fn();
    const unsubscribe = subscribeHealthSyncPreferences(listener);

    const prefs = await setHealthSyncEnabled(true);
    expect(prefs.syncEnabled).toBe(true);
    expect(prefs.syncWorkouts).toBe(true);
    expect(prefs.workoutsDefaultApplied).toBe(true);

    expect(getHealthSyncPreferencesSync().syncEnabled).toBe(true);
    expect(listener).toHaveBeenCalled();

    unsubscribe();
  });

  it('updates workout sync toggle independently', async () => {
    await setHealthSyncEnabled(true);
    const prefs = await setHealthSyncWorkouts(false);
    expect(prefs.syncWorkouts).toBe(false);
    expect(getHealthSyncPreferencesSync().syncWorkouts).toBe(false);
  });

  it('records last sync success timestamp', async () => {
    const timestamp = '2026-07-26T12:00:00.000Z';
    await markHealthSyncSuccess(timestamp);
    const prefs = await loadHealthSyncPreferences();
    expect(prefs.lastSuccessAt).toBe(timestamp);
  });

  it('clears stored health sync preferences', async () => {
    await setHealthSyncEnabled(true);
    await clearHealthSyncPreferences();
    const prefs = getHealthSyncPreferencesSync();
    expect(prefs.syncEnabled).toBe(false);
  });
});
