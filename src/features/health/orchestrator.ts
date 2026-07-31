import { onlineManager } from '@tanstack/react-query';
import { Platform } from 'react-native';

import { loadTokens } from '@/src/auth/tokenStorage';

import { fetchRemoteWorkoutsForMatch } from './fetchRemoteWorkouts';
import {
  beginLedgerAttempt,
  completeLedgerPending,
  completeLedgerFailure,
  completeLedgerSuccess,
  seedNeedsSync,
  wellnessLedgerId,
  workoutLedgerId,
} from './ledgerHelpers';
import { getLedgerItem, saveLedgerItem } from './ledger';
import {
  localDateYmd,
  mapSampleToWellnessPayload,
  sampleHasMetrics,
  wellnessContentFingerprint,
  wellnessHistoryTitle,
} from './mapToWellnessPayload';
import { matchRemoteWorkout, workoutHistoryTitle } from './matchRemoteWorkout';
import { readPlatformWellness, readPlatformWorkouts } from './readers';
import { isUnsyncedRecentStatus } from './recentWorkoutRows';
import { findPlatformWorkoutSession, listRecentPlatformWorkoutsWithStatus } from './recentWorkouts';
import { loadHealthSyncPreferences, markHealthSyncSuccess } from './syncPreferences';
import type {
  DailyWellnessSample,
  HealthPlatform,
  PlatformWorkoutSession,
  SyncLedgerItem,
} from './types';
import { LOOKBACK_DAYS } from './types';
import { uploadWellnessPayload } from './uploadWellness';
import { uploadPlatformWorkout } from './uploadWorkout';
import { clearWatermarks, resolveReadWindow, setWatermark } from './watermarks';

let inFlight: Promise<SyncPassResult> | null = null;

/**
 * Monotonic generation bumped when sign-out begins (see clearHealthSyncOnSignOut).
 * A running `runHealthSyncPass` captures this value at start; if it goes stale
 * mid-pass, the pass refuses to persist any further ledger/watermark write —
 * closing the window where a sync started before sign-out could still write
 * (or upload with a token that's about to be invalidated) after the clear runs.
 */
let healthSyncGeneration = 0;

export function bumpHealthSyncGeneration(): number {
  healthSyncGeneration += 1;
  return healthSyncGeneration;
}

export function getHealthSyncGeneration(): number {
  return healthSyncGeneration;
}

function isHealthSyncGenerationCurrent(generation: number): boolean {
  return generation === healthSyncGeneration;
}

/**
 * Await any pass already in flight so its writes are guaranteed to either finish
 * or bail out (via the generation check) before the caller proceeds. Used by
 * clearHealthSyncOnSignOut so the ledger clear cannot race a stale pass.
 */
export async function awaitInFlightHealthSyncPass(): Promise<void> {
  if (!inFlight) return;
  try {
    await inFlight;
  } catch {
    // Any failure is the pass's own concern — nothing to surface here.
  }
}

export type SyncPassResult = {
  wellnessAttempted: number;
  wellnessSynced: number;
  wellnessFailed: number;
  workoutsAttempted: number;
  workoutsSynced: number;
  workoutsFailed: number;
  workoutsPending: number;
  wellnessPassError: boolean;
  workoutPassError: boolean;
  /** False when the platform store returned no usable data at all (e.g. iOS silently denied reads). */
  foundLocalData: boolean;
  skipped: boolean;
  reason?: string;
  /** True when a sign-out happened mid-pass and the pass stopped writing early. */
  signedOutMidPass: boolean;
};

/** Stop auto-retrying an item after this many failed attempts (manual retry still works). */
const MAX_AUTO_SYNC_ATTEMPTS = 5;
const QUEUED_RETRY_AFTER_MS = 30 * 60 * 1000;

function emptyResult(partial: Partial<SyncPassResult> & { skipped: boolean }): SyncPassResult {
  return {
    wellnessAttempted: 0,
    wellnessSynced: 0,
    wellnessFailed: 0,
    workoutsAttempted: 0,
    workoutsSynced: 0,
    workoutsFailed: 0,
    workoutsPending: 0,
    wellnessPassError: false,
    workoutPassError: false,
    foundLocalData: false,
    signedOutMidPass: false,
    ...partial,
  };
}

async function ensureAuthenticated(): Promise<boolean> {
  const tokens = await loadTokens();
  return !!tokens?.accessToken;
}

/** Days at least this recent are always re-uploaded — their metrics still change. */
const WELLNESS_RESYNC_WINDOW_DAYS = 2;

function wellnessResyncCutoffYmd(): string {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - (WELLNESS_RESYNC_WINDOW_DAYS - 1));
  return localDateYmd(cutoff);
}

function currentPlatform(): HealthPlatform | null {
  if (Platform.OS === 'ios') return 'healthkit';
  if (Platform.OS === 'android') return 'health_connect';
  return null;
}

async function syncWellnessSample(
  sample: DailyWellnessSample,
  force = false,
  generation?: number,
): Promise<'synced' | 'failed' | 'skipped' | 'cancelled'> {
  if (!sampleHasMetrics(sample)) return 'skipped';
  if (generation !== undefined && !isHealthSyncGenerationCurrent(generation)) return 'cancelled';

  const id = wellnessLedgerId(sample.date);
  const existing = await getLedgerItem(id);
  const fingerprint = wellnessContentFingerprint(sample);

  // Older days rarely change once synced — skip unless forced or content changed.
  // Current + previous day always re-push (metrics still settle).
  if (!force && existing?.status === 'synced' && sample.date < wellnessResyncCutoffYmd()) {
    if (!existing.contentFingerprint || existing.contentFingerprint === fingerprint) {
      return 'skipped';
    }
  }

  // Back off items that keep failing; a manual retry (force) resumes them.
  if (!force && existing?.status === 'failed' && existing.attemptCount >= MAX_AUTO_SYNC_ATTEMPTS) {
    // Keep the pass unresolved so its watermark cannot move beyond an item
    // that still needs a manual retry.
    return 'failed';
  }
  let item: SyncLedgerItem =
    existing ??
    seedNeedsSync('wellness', {
      id,
      kind: 'wellness',
      platform: sample.platform,
      title: wellnessHistoryTitle(sample.date),
      localDate: sample.date,
    });

  item = beginLedgerAttempt(item);
  if (generation !== undefined && !isHealthSyncGenerationCurrent(generation)) return 'cancelled';
  await saveLedgerItem(item);

  try {
    await uploadWellnessPayload(mapSampleToWellnessPayload(sample));
    if (generation !== undefined && !isHealthSyncGenerationCurrent(generation)) return 'cancelled';
    item = completeLedgerSuccess(item, { contentFingerprint: fingerprint });
    await saveLedgerItem(item);
    await markHealthSyncSuccess(item.lastSuccessAt);
    return 'synced';
  } catch (err) {
    if (generation !== undefined && !isHealthSyncGenerationCurrent(generation)) return 'cancelled';
    const message = err instanceof Error ? err.message : 'Upload failed';
    item = completeLedgerFailure(item, message);
    await saveLedgerItem(item);
    return 'failed';
  }
}

async function syncWorkoutSession(
  session: PlatformWorkoutSession,
  remotes: Awaited<ReturnType<typeof fetchRemoteWorkoutsForMatch>>,
  force = false,
  generation?: number,
): Promise<'synced' | 'pending' | 'failed' | 'skipped' | 'cancelled'> {
  if (generation !== undefined && !isHealthSyncGenerationCurrent(generation)) return 'cancelled';

  const id = workoutLedgerId(session.platformSessionId);
  const existing = await getLedgerItem(id);

  // Already uploaded/matched — converge without re-upload unless forced.
  if (!force && existing?.status === 'synced' && existing.remoteWorkoutId) {
    return 'skipped';
  }

  if (generation !== undefined && !isHealthSyncGenerationCurrent(generation)) return 'cancelled';

  const matched = matchRemoteWorkout(session, remotes);
  if (matched) {
    const item = completeLedgerSuccess(
      existing ??
        seedNeedsSync('workout', {
          id,
          kind: 'workout',
          platform: session.platform,
          title: workoutHistoryTitle(session),
          startedAt: session.startedAt,
        }),
      { remoteWorkoutId: matched.id },
    );
    await saveLedgerItem(item);
    await markHealthSyncSuccess(item.lastSuccessAt);
    return 'synced';
  }

  if (!force && existing?.status === 'pending' && existing.lastAttemptAt) {
    const queuedAt = new Date(existing.lastAttemptAt).getTime();
    if (Number.isFinite(queuedAt) && Date.now() - queuedAt < QUEUED_RETRY_AFTER_MS) {
      return 'pending';
    }
  }

  if (!force && existing?.status === 'failed' && existing.attemptCount >= MAX_AUTO_SYNC_ATTEMPTS) {
    // Preserve the failure and block watermark advancement without issuing
    // an unbounded number of automatic upload attempts.
    return 'failed';
  }

  let item: SyncLedgerItem =
    existing ??
    seedNeedsSync('workout', {
      id,
      kind: 'workout',
      platform: session.platform,
      title: workoutHistoryTitle(session),
      startedAt: session.startedAt,
    });

  if (generation !== undefined && !isHealthSyncGenerationCurrent(generation)) return 'cancelled';

  if (!existing) {
    await saveLedgerItem(item);
  }

  item = beginLedgerAttempt(item);
  if (generation !== undefined && !isHealthSyncGenerationCurrent(generation)) return 'cancelled';
  await saveLedgerItem(item);

  try {
    const result = await uploadPlatformWorkout(session);
    if (generation !== undefined && !isHealthSyncGenerationCurrent(generation)) return 'cancelled';
    if (result.queued && !result.remoteWorkoutId) {
      item = completeLedgerPending(item);
      await saveLedgerItem(item);
      return 'pending';
    }
    item = completeLedgerSuccess(item, { remoteWorkoutId: result.remoteWorkoutId });
    await saveLedgerItem(item);
    await markHealthSyncSuccess(item.lastSuccessAt);
    return 'synced';
  } catch (err) {
    if (generation !== undefined && !isHealthSyncGenerationCurrent(generation)) return 'cancelled';
    const message = err instanceof Error ? err.message : 'Upload failed';
    item = completeLedgerFailure(item, message);
    await saveLedgerItem(item);
    return 'failed';
  }
}

/**
 * Full sync pass. Single-flight — concurrent callers await the same promise.
 * Incremental watermark reads by default; `fullResync` clears watermarks and
 * backfills the lookback window. Recent wellness days are always re-read.
 */
export async function runHealthSyncPass(
  options: { force?: boolean; fullResync?: boolean } = {},
): Promise<SyncPassResult> {
  if (inFlight) return inFlight;

  // Capture the generation this pass runs under. If sign-out bumps it mid-pass,
  // every write below is gated on it staying current — see isHealthSyncGenerationCurrent.
  const generation = healthSyncGeneration;

  inFlight = (async () => {
    const prefs = await loadHealthSyncPreferences();
    if (!prefs.syncEnabled) {
      return emptyResult({ skipped: true, reason: 'sync_disabled' });
    }
    if (!(await ensureAuthenticated())) {
      return emptyResult({ skipped: true, reason: 'not_authenticated' });
    }
    if (!onlineManager.isOnline()) {
      return emptyResult({ skipped: true, reason: 'offline' });
    }
    if (!isHealthSyncGenerationCurrent(generation)) {
      return emptyResult({ skipped: true, reason: 'signed_out', signedOutMidPass: true });
    }

    if (options.fullResync) {
      await clearWatermarks();
    }

    const force = options.force === true || options.fullResync === true;
    const result = emptyResult({ skipped: false });
    const platform = currentPlatform();
    const passEndedAt = new Date().toISOString();

    try {
      const wellnessWindow = await resolveReadWindow('wellness', {
        fullResync: options.fullResync,
        lookbackDays: LOOKBACK_DAYS,
      });
      const samples = await readPlatformWellness(wellnessWindow);
      for (const sample of samples) {
        if (!sampleHasMetrics(sample)) continue;
        result.foundLocalData = true;
        const status = await syncWellnessSample(sample, force, generation);
        if (status === 'skipped') continue;
        if (status === 'cancelled') {
          result.signedOutMidPass = true;
          return result;
        }
        result.wellnessAttempted += 1;
        if (status === 'synced') result.wellnessSynced += 1;
        else result.wellnessFailed += 1;
      }
      // Advance watermark only after a successful push so failures retry next pass.
      if (
        platform &&
        result.wellnessFailed === 0 &&
        isHealthSyncGenerationCurrent(generation)
      ) {
        await setWatermark('wellness', passEndedAt, platform);
      }
    } catch (err) {
      result.wellnessPassError = true;
      console.warn(
        '[HealthSync] wellness pass error',
        err instanceof Error ? err.message : 'error',
      );
    }

    if (!isHealthSyncGenerationCurrent(generation)) {
      result.signedOutMidPass = true;
      return result;
    }

    if (prefs.syncWorkouts) {
      try {
        const workoutWindow = await resolveReadWindow('workout', {
          fullResync: options.fullResync,
          lookbackDays: LOOKBACK_DAYS,
        });
        const sessions = await readPlatformWorkouts(workoutWindow);
        if (sessions.length > 0) result.foundLocalData = true;
        const remotes = await fetchRemoteWorkoutsForMatch(LOOKBACK_DAYS);
        for (const session of sessions) {
          if (!isHealthSyncGenerationCurrent(generation)) {
            result.signedOutMidPass = true;
            return result;
          }
          const id = workoutLedgerId(session.platformSessionId);
          const existing = await getLedgerItem(id);
          if (!existing) {
            if (!isHealthSyncGenerationCurrent(generation)) {
              result.signedOutMidPass = true;
              return result;
            }
            await saveLedgerItem(
              seedNeedsSync('workout', {
                id,
                kind: 'workout',
                platform: session.platform,
                title: workoutHistoryTitle(session),
                startedAt: session.startedAt,
              }),
            );
          }
          if (existing?.status === 'synced' && existing.remoteWorkoutId && !force) continue;
          const status = await syncWorkoutSession(session, remotes, force, generation);
          if (status === 'skipped') continue;
          if (status === 'cancelled') {
            result.signedOutMidPass = true;
            return result;
          }
          result.workoutsAttempted += 1;
          if (status === 'synced') result.workoutsSynced += 1;
          else if (status === 'pending') result.workoutsPending += 1;
          else result.workoutsFailed += 1;
        }
        if (
          platform &&
          result.workoutsFailed === 0 &&
          result.workoutsPending === 0 &&
          isHealthSyncGenerationCurrent(generation)
        ) {
          await setWatermark('workout', passEndedAt, platform);
        }
      } catch (err) {
        result.workoutPassError = true;
        console.warn(
          '[HealthSync] workout pass error',
          err instanceof Error ? err.message : 'error',
        );
      }
    }

    return result;
  })().finally(() => {
    inFlight = null;
  });

  return inFlight;
}

async function throwLedgerFailure(id: string): Promise<never> {
  const updated = await getLedgerItem(id);
  throw new Error(updated?.lastError ?? 'Sync failed');
}

async function assertWorkoutSyncAllowed(): Promise<void> {
  const prefs = await loadHealthSyncPreferences();
  if (!prefs.syncEnabled) {
    throw new Error('Enable Sync to Coach Watts first');
  }
  if (!prefs.syncWorkouts) {
    throw new Error('Enable Sync workouts first');
  }
  if (!(await ensureAuthenticated())) {
    throw new Error('Sign in to sync');
  }
  if (!onlineManager.isOnline()) {
    throw new Error('No internet connection');
  }
}

export async function retryLedgerItem(id: string): Promise<void> {
  const prefs = await loadHealthSyncPreferences();
  if (!prefs.syncEnabled) {
    throw new Error('Enable Sync to Coach Watts first');
  }
  if (!(await ensureAuthenticated())) {
    throw new Error('Sign in to sync');
  }
  if (!onlineManager.isOnline()) {
    throw new Error('No internet connection');
  }

  const item = await getLedgerItem(id);
  if (!item) throw new Error('Sync item not found');

  if (item.kind === 'wellness') {
    if (!item.localDate) throw new Error('Missing wellness date');
    const samples = await readPlatformWellness({ lookbackDays: LOOKBACK_DAYS });
    const sample = samples.find((s) => s.date === item.localDate);
    if (!sample || !sampleHasMetrics(sample)) {
      throw new Error('No on-device metrics for that day');
    }
    const status = await syncWellnessSample(sample, true);
    if (status === 'failed') await throwLedgerFailure(id);
    return;
  }

  if (!prefs.syncWorkouts) {
    throw new Error('Enable Sync workouts first');
  }
  const sessions = await readPlatformWorkouts({ lookbackDays: LOOKBACK_DAYS });
  const sessionId = id.replace(/^workout:/, '');
  const session = sessions.find((s) => s.platformSessionId === sessionId);
  if (!session) throw new Error('Workout no longer on device');
  const remotes = await fetchRemoteWorkoutsForMatch(LOOKBACK_DAYS);
  const status = await syncWorkoutSession(session, remotes, true);
  if (status === 'failed') await throwLedgerFailure(id);
}

/**
 * Sync (or force resync) a single on-device workout by platform session id.
 */
export async function syncWorkoutByPlatformSessionId(
  platformSessionId: string,
  options: { force?: boolean } = {},
): Promise<void> {
  await assertWorkoutSyncAllowed();

  const session = await findPlatformWorkoutSession(platformSessionId);
  if (!session) throw new Error('Workout no longer on device');

  const remotes = await fetchRemoteWorkoutsForMatch(LOOKBACK_DAYS);
  const force = options.force === true;
  const status = await syncWorkoutSession(session, remotes, force);
  if (status === 'failed') {
    await throwLedgerFailure(workoutLedgerId(platformSessionId));
  }
}

export type SyncUnsyncedWorkoutsResult = {
  attempted: number;
  synced: number;
  failed: number;
  pending: number;
};

/** Sync only inventory rows that are needs_sync / failed / pending. */
export async function syncUnsyncedWorkouts(): Promise<SyncUnsyncedWorkoutsResult> {
  await assertWorkoutSyncAllowed();

  const [rows, sessions, remotes] = await Promise.all([
    listRecentPlatformWorkoutsWithStatus(),
    readPlatformWorkouts({ lookbackDays: LOOKBACK_DAYS }),
    fetchRemoteWorkoutsForMatch(LOOKBACK_DAYS),
  ]);
  const sessionById = new Map(sessions.map((s) => [s.platformSessionId, s]));
  const targets = rows.filter((row) => isUnsyncedRecentStatus(row.status));
  const result: SyncUnsyncedWorkoutsResult = {
    attempted: 0,
    synced: 0,
    failed: 0,
    pending: 0,
  };

  for (const row of targets) {
    const session = sessionById.get(row.platformSessionId);
    result.attempted += 1;
    if (!session) {
      result.failed += 1;
      continue;
    }
    const status = await syncWorkoutSession(session, remotes, true);
    if (status === 'synced' || status === 'skipped') result.synced += 1;
    else if (status === 'pending') result.pending += 1;
    else result.failed += 1;
  }
  return result;
}
