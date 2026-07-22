import { workoutLedgerId } from './ledgerHelpers';
import { matchRemoteWorkout, workoutHistoryTitle } from './matchRemoteWorkout';
import type {
  PlatformWorkoutSession,
  RemoteWorkoutMatchCandidate,
  SyncLedgerItem,
  SyncLedgerStatus,
} from './types';

export type RecentWorkoutRow = {
  platformSessionId: string;
  platform: PlatformWorkoutSession['platform'];
  title: string;
  startedAt: string;
  durationSec?: number;
  status: SyncLedgerStatus;
  remoteWorkoutId?: string;
  lastError?: string;
  ledgerId: string;
};

const UNSYNCED: ReadonlySet<SyncLedgerStatus> = new Set([
  'needs_sync',
  'failed',
  'pending',
]);

export function isUnsyncedRecentStatus(status: SyncLedgerStatus): boolean {
  return UNSYNCED.has(status);
}

/**
 * Resolve display status for an on-device workout from ledger + remote match.
 * Remote match or ledger `synced` → synced; otherwise prefer ledger attention
 * statuses; bare on-device rows are `needs_sync`.
 */
export function resolveRecentWorkoutStatus(
  session: PlatformWorkoutSession,
  ledgerItem: SyncLedgerItem | undefined,
  remotes: RemoteWorkoutMatchCandidate[]
): SyncLedgerStatus {
  if (ledgerItem?.status === 'syncing') return 'syncing';

  if (ledgerItem?.status === 'synced') return 'synced';

  const matched = matchRemoteWorkout(session, remotes);
  if (matched || ledgerItem?.remoteWorkoutId) return 'synced';

  if (ledgerItem?.status === 'failed') return 'failed';
  if (ledgerItem?.status === 'pending') return 'pending';
  if (ledgerItem?.status === 'needs_sync') return 'needs_sync';

  return 'needs_sync';
}

export function buildRecentWorkoutRows(
  sessions: PlatformWorkoutSession[],
  remotes: RemoteWorkoutMatchCandidate[],
  ledgerItems: SyncLedgerItem[]
): RecentWorkoutRow[] {
  const ledgerById = new Map(ledgerItems.map((item) => [item.id, item]));

  const rows = sessions.map((session) => {
    const ledgerId = workoutLedgerId(session.platformSessionId);
    const ledgerItem = ledgerById.get(ledgerId);
    const matched = matchRemoteWorkout(session, remotes);
    const status = resolveRecentWorkoutStatus(session, ledgerItem, remotes);

    return {
      platformSessionId: session.platformSessionId,
      platform: session.platform,
      title: workoutHistoryTitle(session),
      startedAt: session.startedAt,
      durationSec: session.durationSec,
      status,
      remoteWorkoutId: ledgerItem?.remoteWorkoutId ?? matched?.id,
      lastError: status === 'failed' ? ledgerItem?.lastError : undefined,
      ledgerId,
    };
  });

  return rows.sort((a, b) => b.startedAt.localeCompare(a.startedAt));
}
