import { describe, expect, it } from 'vitest';

import {
  buildRecentWorkoutRows,
  isUnsyncedRecentStatus,
  resolveRecentWorkoutStatus,
} from '../recentWorkoutRows';
import type { PlatformWorkoutSession, RemoteWorkoutMatchCandidate, SyncLedgerItem } from '../types';

describe('recentWorkoutRows', () => {
  const sampleSession: PlatformWorkoutSession = {
    platformSessionId: 'sess-123',
    platform: 'healthkit',
    sportType: 'cycling',
    startedAt: '2026-07-26T10:00:00Z',
    durationSec: 3600,
    distanceMeters: 30000,
  };

  const sampleRemote: RemoteWorkoutMatchCandidate = {
    id: 'remote-789',
    date: '2026-07-26T10:00:00Z',
    durationSec: 3600,
    type: 'cycling',
  };

  describe('isUnsyncedRecentStatus', () => {
    it('identifies unsynced statuses', () => {
      expect(isUnsyncedRecentStatus('needs_sync')).toBe(true);
      expect(isUnsyncedRecentStatus('failed')).toBe(true);
      expect(isUnsyncedRecentStatus('pending')).toBe(true);
      expect(isUnsyncedRecentStatus('synced')).toBe(false);
      expect(isUnsyncedRecentStatus('syncing')).toBe(false);
    });
  });

  describe('resolveRecentWorkoutStatus', () => {
    it('returns syncing if ledger is syncing', () => {
      const ledger: SyncLedgerItem = {
        id: 'w:healthkit:sess-123',
        kind: 'workout',
        platform: 'healthkit',
        title: 'Cycling',
        status: 'syncing',
        attemptCount: 1,
      };
      expect(resolveRecentWorkoutStatus(sampleSession, ledger, [])).toBe('syncing');
    });

    it('returns synced if ledger status is synced or remote workout is matched', () => {
      const ledger: SyncLedgerItem = {
        id: 'w:healthkit:sess-123',
        kind: 'workout',
        platform: 'healthkit',
        title: 'Cycling',
        status: 'synced',
        remoteWorkoutId: 'remote-789',
        attemptCount: 1,
      };
      expect(resolveRecentWorkoutStatus(sampleSession, ledger, [])).toBe('synced');
      expect(resolveRecentWorkoutStatus(sampleSession, undefined, [sampleRemote])).toBe('synced');
    });

    it('returns failed or pending or needs_sync based on ledger item', () => {
      const failedLedger: SyncLedgerItem = {
        id: 'w:healthkit:sess-123',
        kind: 'workout',
        platform: 'healthkit',
        title: 'Cycling',
        status: 'failed',
        lastError: 'Network timeout',
        attemptCount: 1,
      };
      expect(resolveRecentWorkoutStatus(sampleSession, failedLedger, [])).toBe('failed');

      const pendingLedger: SyncLedgerItem = {
        id: 'w:healthkit:sess-123',
        kind: 'workout',
        platform: 'healthkit',
        title: 'Cycling',
        status: 'pending',
        attemptCount: 1,
      };
      expect(resolveRecentWorkoutStatus(sampleSession, pendingLedger, [])).toBe('pending');
    });

    it('defaults to needs_sync when no remote match or ledger state', () => {
      expect(resolveRecentWorkoutStatus(sampleSession, undefined, [])).toBe('needs_sync');
    });
  });

  describe('buildRecentWorkoutRows', () => {
    it('builds sorted workout rows with accurate ledger and remote match details', () => {
      const sessionOlder: PlatformWorkoutSession = {
        platformSessionId: 'sess-100',
        platform: 'healthkit',
        sportType: 'running',
        startedAt: '2026-07-25T08:00:00Z',
        durationSec: 1800,
      };

      const rows = buildRecentWorkoutRows(
        [sessionOlder, sampleSession],
        [sampleRemote],
        [
          {
            id: 'w:healthkit:sess-123',
            kind: 'workout',
            platform: 'healthkit',
            title: 'Cycling',
            status: 'synced',
            remoteWorkoutId: 'remote-789',
            attemptCount: 1,
          },
        ]
      );

      expect(rows).toHaveLength(2);
      // Newest session first
      expect(rows[0]?.platformSessionId).toBe('sess-123');
      expect(rows[0]?.status).toBe('synced');
      expect(rows[0]?.remoteWorkoutId).toBe('remote-789');

      expect(rows[1]?.platformSessionId).toBe('sess-100');
      expect(rows[1]?.status).toBe('needs_sync');
    });
  });
});
