import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('react-native', () => ({ Platform: { OS: 'ios' } }));

vi.mock('@tanstack/react-query', () => ({
  onlineManager: { isOnline: () => true },
}));

vi.mock('@/src/auth/tokenStorage', () => ({
  loadTokens: vi.fn(async () => ({ accessToken: 'token-123' })),
}));

vi.mock('../syncPreferences', () => ({
  loadHealthSyncPreferences: vi.fn(async () => ({
    syncEnabled: true,
    syncWorkouts: false,
    workoutsDefaultApplied: true,
  })),
  markHealthSyncSuccess: vi.fn(async () => {}),
}));

vi.mock('../fetchRemoteWorkouts', () => ({
  fetchRemoteWorkoutsForMatch: vi.fn(async () => []),
}));

vi.mock('../uploadWellness', () => ({
  uploadWellnessPayload: vi.fn(async () => {}),
}));

vi.mock('../uploadWorkout', () => ({
  uploadPlatformWorkout: vi.fn(async () => ({ queued: false, remoteWorkoutId: 'r1' })),
}));

const readPlatformWellness = vi.fn();
const readPlatformWorkouts = vi.fn(async () => []);
vi.mock('../readers', () => ({
  readPlatformWellness: (...args: Parameters<typeof readPlatformWellness>) =>
    readPlatformWellness(...args),
  readPlatformWorkouts: (...args: Parameters<typeof readPlatformWorkouts>) =>
    readPlatformWorkouts(...args),
}));

const setWatermark = vi.fn(async () => {});
vi.mock('../watermarks', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../watermarks')>();
  return {
    ...actual,
    setWatermark: (...args: Parameters<typeof setWatermark>) => setWatermark(...args),
  };
});

import { _resetWatermarksForTests } from '../watermarks';
import { runHealthSyncPass } from '../orchestrator';

function wellnessSample(date: string, hasMetrics: boolean) {
  return {
    date,
    platform: 'healthkit' as const,
    ...(hasMetrics ? { steps: 4200 } : {}),
  };
}

describe('runHealthSyncPass watermark advancement', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    readPlatformWorkouts.mockResolvedValue([]);
    await _resetWatermarksForTests();
  });

  it('advances the wellness watermark when a read is authorized and returns data', async () => {
    readPlatformWellness.mockResolvedValue([wellnessSample('2026-07-30', true)]);

    const result = await runHealthSyncPass();

    expect(result.wellnessFailed).toBe(0);
    expect(result.foundLocalData).toBe(true);
    expect(setWatermark).toHaveBeenCalledWith('wellness', expect.any(String), 'healthkit');
  });

  it('does NOT advance the wellness watermark when the read comes back empty (denied/unavailable)', async () => {
    // Every day in the window came back with no usable metrics — HealthKit
    // does not distinguish "permission denied" from "genuinely nothing to
    // sync" at the API level, so an all-empty read must not be treated as a
    // completed sync.
    readPlatformWellness.mockResolvedValue([
      wellnessSample('2026-07-29', false),
      wellnessSample('2026-07-30', false),
    ]);

    const result = await runHealthSyncPass();

    expect(result.wellnessFailed).toBe(0);
    expect(result.foundLocalData).toBe(false);
    expect(setWatermark).not.toHaveBeenCalled();
  });
});
