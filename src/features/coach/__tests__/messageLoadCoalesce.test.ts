import { describe, expect, it } from 'vitest';

import {
  coalescePendingLoad,
  resolveFollowUpLoad,
  shouldApplyMessageLoad,
} from '../messageLoadCoalesce';

describe('coalescePendingLoad', () => {
  it('stores the first pending request', () => {
    expect(coalescePendingLoad(null, { roomId: 'a', silent: false }, 'a')).toEqual({
      roomId: 'a',
      silent: false,
    });
  });

  it('keeps non-silent when the same room is requested again silently', () => {
    expect(
      coalescePendingLoad({ roomId: 'b', silent: false }, { roomId: 'b', silent: true }, 'b'),
    ).toEqual({ roomId: 'b', silent: false });
  });

  it('latest room wins on a non-silent switch', () => {
    expect(
      coalescePendingLoad({ roomId: 'a', silent: true }, { roomId: 'b', silent: false }, 'b'),
    ).toEqual({ roomId: 'b', silent: false });
  });

  it('ignores silent loads for a room that is no longer active', () => {
    expect(
      coalescePendingLoad({ roomId: 'b', silent: false }, { roomId: 'a', silent: true }, 'b'),
    ).toEqual({ roomId: 'b', silent: false });
  });
});

describe('resolveFollowUpLoad', () => {
  it('reloads the pending room after the in-flight request finishes', () => {
    expect(
      resolveFollowUpLoad({
        pending: { roomId: 'b', silent: false },
        activeRoomId: 'b',
        completedRoomId: 'a',
      }),
    ).toEqual({ roomId: 'b', silent: false });
  });

  it('falls back to the active room when pending is missing after a switch', () => {
    expect(
      resolveFollowUpLoad({
        pending: null,
        activeRoomId: 'b',
        completedRoomId: 'a',
      }),
    ).toEqual({ roomId: 'b', silent: false });
  });

  it('does not reload when the completed room is still active and nothing is pending', () => {
    expect(
      resolveFollowUpLoad({
        pending: null,
        activeRoomId: 'a',
        completedRoomId: 'a',
      }),
    ).toBeNull();
  });

  it('prefers the active room over a stale pending id', () => {
    expect(
      resolveFollowUpLoad({
        pending: { roomId: 'a', silent: true },
        activeRoomId: 'b',
        completedRoomId: 'a',
      }),
    ).toEqual({ roomId: 'b', silent: false });
  });
});

describe('shouldApplyMessageLoad', () => {
  it('applies only matching generation and active room', () => {
    expect(
      shouldApplyMessageLoad({
        isActive: true,
        requestGeneration: 2,
        currentGeneration: 2,
        requestedRoomId: 'b',
        activeRoomId: 'b',
      }),
    ).toBe(true);

    expect(
      shouldApplyMessageLoad({
        isActive: true,
        requestGeneration: 1,
        currentGeneration: 2,
        requestedRoomId: 'a',
        activeRoomId: 'b',
      }),
    ).toBe(false);

    expect(
      shouldApplyMessageLoad({
        isActive: true,
        requestGeneration: 2,
        currentGeneration: 2,
        requestedRoomId: 'a',
        activeRoomId: 'b',
      }),
    ).toBe(false);
  });
});
