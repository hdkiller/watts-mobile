import { describe, expect, it, vi } from 'vitest';

import { invalidateQueriesForPush, workoutIdFromPushData } from '../invalidateFromPush';

describe('workoutIdFromPushData', () => {
  it('reads workoutId / activityId extras', () => {
    expect(workoutIdFromPushData({ workoutId: 'w1' })).toBe('w1');
    expect(workoutIdFromPushData({ activityId: 'a1' })).toBe('a1');
  });

  it('parses canonical and app paths', () => {
    expect(workoutIdFromPushData({ path: '/activities/abc' })).toBe('abc');
    expect(workoutIdFromPushData({ path: '/(app)/activity/xyz' })).toBe('xyz');
    expect(workoutIdFromPushData({ url: 'coachwatts://activities/q%2Fw' })).toBe('q/w');
  });

  it('returns null when nothing resolvable', () => {
    expect(workoutIdFromPushData({ type: 'WORKOUT_ANALYSIS_READY' })).toBeNull();
    expect(workoutIdFromPushData(null)).toBeNull();
  });
});

describe('invalidateQueriesForPush', () => {
  it('always invalidates the inbox', async () => {
    const invalidateQueries = vi.fn(async () => undefined);
    await invalidateQueriesForPush({ invalidateQueries } as never, { type: 'COACH_MESSAGE' });
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['notifications', 'inbox'],
    });
    expect(invalidateQueries).toHaveBeenCalledTimes(1);
  });

  it('invalidates activity detail on WORKOUT_ANALYSIS_READY', async () => {
    const invalidateQueries = vi.fn(async () => undefined);
    await invalidateQueriesForPush(
      { invalidateQueries } as never,
      { type: 'WORKOUT_ANALYSIS_READY', path: '/activities/w99' }
    );
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['activity', 'detail', 'w99'],
    });
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['activity', 'recent'],
    });
  });
});
