import { describe, expect, it } from 'vitest';

import { matchRemoteWorkout } from '../matchRemoteWorkout';

describe('matchRemoteWorkout', () => {
  it('matches within start-time tolerance', () => {
    const match = matchRemoteWorkout(
      {
        platformSessionId: 'a',
        platform: 'healthkit',
        startedAt: '2026-07-20T08:00:00.000Z',
        durationSec: 3600,
      },
      [
        {
          id: 'remote-1',
          date: '2026-07-20T08:02:00.000Z',
          type: 'run',
          durationSec: 3500,
        },
      ]
    );
    expect(match?.id).toBe('remote-1');
  });

  it('matches a date-only remote on the same local day with close duration', () => {
    const startedAt = new Date(2026, 6, 20, 12, 0, 0).toISOString();
    const match = matchRemoteWorkout(
      {
        platformSessionId: 'a',
        platform: 'healthkit',
        startedAt,
        durationSec: 3600,
      },
      [{ id: 'remote-1', date: '2026-07-20', type: 'run', durationSec: 3500 }]
    );
    expect(match?.id).toBe('remote-1');
  });

  it('rejects a date-only remote when durations disagree', () => {
    const startedAt = new Date(2026, 6, 20, 12, 0, 0).toISOString();
    const match = matchRemoteWorkout(
      {
        platformSessionId: 'a',
        platform: 'healthkit',
        startedAt,
        durationSec: 3600,
      },
      [{ id: 'remote-1', date: '2026-07-20', type: 'run', durationSec: 600 }]
    );
    expect(match).toBeNull();
  });

  it('rejects a date-only remote on a different local day', () => {
    const startedAt = new Date(2026, 6, 20, 12, 0, 0).toISOString();
    const match = matchRemoteWorkout(
      {
        platformSessionId: 'a',
        platform: 'healthkit',
        startedAt,
        durationSec: 3600,
      },
      [{ id: 'remote-1', date: '2026-07-19', type: 'run', durationSec: 3600 }]
    );
    expect(match).toBeNull();
  });

  it('prefers a timestamp match over a date-only match', () => {
    const start = new Date(2026, 6, 20, 12, 0, 0);
    const match = matchRemoteWorkout(
      {
        platformSessionId: 'a',
        platform: 'healthkit',
        startedAt: start.toISOString(),
        durationSec: 3600,
      },
      [
        { id: 'date-only', date: '2026-07-20', type: 'run', durationSec: 3600 },
        {
          id: 'timestamped',
          date: new Date(start.getTime() + 60_000).toISOString(),
          type: 'run',
          durationSec: 3600,
        },
      ]
    );
    expect(match?.id).toBe('timestamped');
  });

  it('rejects far starts', () => {
    const match = matchRemoteWorkout(
      {
        platformSessionId: 'a',
        platform: 'health_connect',
        startedAt: '2026-07-20T08:00:00.000Z',
        durationSec: 3600,
      },
      [
        {
          id: 'remote-1',
          date: '2026-07-20T10:00:00.000Z',
          type: 'run',
          durationSec: 3600,
        },
      ]
    );
    expect(match).toBeNull();
  });

  it('prefers the stable platform external id over heuristic fields', () => {
    const match = matchRemoteWorkout(
      {
        platformSessionId: 'session-123',
        platform: 'healthkit',
        startedAt: '2026-07-20T08:00:00.000Z',
        durationSec: 3600,
        sportType: 'running',
      },
      [
        {
          id: 'remote-1',
          externalId: 'health_healthkit_session-123',
          date: '2026-01-01',
          type: 'cycling',
          durationSec: null,
        },
      ]
    );
    expect(match?.id).toBe('remote-1');
  });

  it('rejects a close workout of a different sport', () => {
    const match = matchRemoteWorkout(
      {
        platformSessionId: 'a',
        platform: 'health_connect',
        startedAt: '2026-07-20T08:00:00.000Z',
        durationSec: 3600,
        sportType: 'running',
      },
      [
        {
          id: 'remote-1',
          date: '2026-07-20T08:01:00.000Z',
          type: 'cycling',
          durationSec: 3600,
        },
      ]
    );
    expect(match).toBeNull();
  });

  it('does not guess from a date-only workout without duration', () => {
    const match = matchRemoteWorkout(
      {
        platformSessionId: 'a',
        platform: 'healthkit',
        startedAt: new Date(2026, 6, 20, 12, 0, 0).toISOString(),
        sportType: 'running',
      },
      [{ id: 'remote-1', date: '2026-07-20', type: 'run', durationSec: null }]
    );
    expect(match).toBeNull();
  });
});
