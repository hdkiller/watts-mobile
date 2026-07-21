import { describe, expect, it } from 'vitest';

import { bucketHealthConnectSleep, type HcSleepSession } from '../readers/sleepShared';

const HOUR = 60 * 60 * 1000;
const base = new Date('2026-07-20T22:00:00.000Z').getTime();

function stage(stageNo: number, fromHours: number, toHours: number) {
  return {
    stage: stageNo,
    startTime: new Date(base + fromHours * HOUR).toISOString(),
    endTime: new Date(base + toHours * HOUR).toISOString(),
  };
}

function session(stages: ReturnType<typeof stage>[], fromHours = 0, toHours = 8): HcSleepSession {
  return { start: base + fromHours * HOUR, end: base + toHours * HOUR, stages };
}

describe('bucketHealthConnectSleep', () => {
  it('sums asleep stages and excludes awake', () => {
    const bucket = bucketHealthConnectSleep([
      session([
        stage(4, 0, 3), // light
        stage(5, 3, 5), // deep
        stage(6, 5, 7), // rem
        stage(1, 7, 8), // awake
      ]),
    ]);

    expect(bucket?.sleepSecs).toBe(7 * 3600);
    expect(bucket?.sleepLightSecs).toBe(3 * 3600);
    expect(bucket?.sleepDeepSecs).toBe(2 * 3600);
    expect(bucket?.sleepRemSecs).toBe(2 * 3600);
    expect(bucket?.sleepAwakeSecs).toBe(1 * 3600);
  });

  it('counts the generic SLEEPING stage toward time asleep, not awake', () => {
    const bucket = bucketHealthConnectSleep([session([stage(2, 0, 6)])]);

    expect(bucket?.sleepSecs).toBe(6 * 3600);
    expect(bucket?.sleepAwakeSecs).toBeUndefined();
  });

  it('does not double-count the same night written by two sources', () => {
    // Watch and phone both record the identical 8h night.
    const stages = [stage(4, 0, 4), stage(5, 4, 8)];
    const bucket = bucketHealthConnectSleep([session(stages), session(stages)]);

    expect(bucket?.sleepSecs).toBe(8 * 3600);
    expect(bucket?.sleepLightSecs).toBe(4 * 3600);
    expect(bucket?.sleepDeepSecs).toBe(4 * 3600);
  });

  it('merges partially overlapping sources rather than summing', () => {
    const bucket = bucketHealthConnectSleep([
      session([stage(2, 0, 6)], 0, 6),
      session([stage(2, 4, 9)], 4, 9),
    ]);

    // Union is 0h→9h, not 6h + 5h.
    expect(bucket?.sleepSecs).toBe(9 * 3600);
  });

  it('falls back to the merged in-bed span when no session carries stages', () => {
    const bucket = bucketHealthConnectSleep([session([], 0, 7), session([], 5, 9)]);

    expect(bucket?.sleepSecs).toBe(9 * 3600);
    expect(bucket?.sleepDeepSecs).toBeUndefined();
  });

  it('returns null with no sessions', () => {
    expect(bucketHealthConnectSleep([])).toBeNull();
  });

  it('ignores malformed stage rows', () => {
    const bucket = bucketHealthConnectSleep([
      session([
        stage(4, 0, 3),
        { stage: 5, startTime: undefined, endTime: undefined },
        { stage: 6, startTime: 'not-a-date', endTime: 'nope' },
        { stage: 4, startTime: new Date(base).toISOString(), endTime: new Date(base).toISOString() },
      ] as ReturnType<typeof stage>[]),
    ]);

    expect(bucket?.sleepSecs).toBe(3 * 3600);
  });
});
