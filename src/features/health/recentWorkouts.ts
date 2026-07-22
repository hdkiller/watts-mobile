import { fetchRemoteWorkoutsForMatch } from './fetchRemoteWorkouts';
import { loadSyncLedger } from './ledger';
import { readPlatformWorkouts } from './readers';
import {
  buildRecentWorkoutRows,
  type RecentWorkoutRow,
} from './recentWorkoutRows';
import type { PlatformWorkoutSession, RemoteWorkoutMatchCandidate } from './types';
import { LOOKBACK_DAYS } from './types';

export type { RecentWorkoutRow } from './recentWorkoutRows';
export {
  buildRecentWorkoutRows,
  isUnsyncedRecentStatus,
  resolveRecentWorkoutStatus,
} from './recentWorkoutRows';

/** Read on-device workouts + remote match + ledger overlay for the lookback window. */
export async function listRecentPlatformWorkoutsWithStatus(
  lookbackDays: number = LOOKBACK_DAYS
): Promise<RecentWorkoutRow[]> {
  const [sessions, ledgerItems] = await Promise.all([
    readPlatformWorkouts({ lookbackDays }),
    loadSyncLedger(),
  ]);

  let remotes: RemoteWorkoutMatchCandidate[] = [];
  try {
    remotes = await fetchRemoteWorkoutsForMatch(lookbackDays);
  } catch (err) {
    console.warn(
      '[HealthSync] recent workouts remote match failed',
      err instanceof Error ? err.message : 'error'
    );
  }

  return buildRecentWorkoutRows(sessions, remotes, ledgerItems);
}

/** Resolve a single session from the device lookback window. */
export async function findPlatformWorkoutSession(
  platformSessionId: string,
  lookbackDays: number = LOOKBACK_DAYS
): Promise<PlatformWorkoutSession | undefined> {
  const sessions = await readPlatformWorkouts({ lookbackDays });
  return sessions.find((s) => s.platformSessionId === platformSessionId);
}
