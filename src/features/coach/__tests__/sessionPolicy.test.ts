import { describe, expect, it } from 'vitest';

import {
  CHAT_SESSION_REUSE_MS,
  decideSessionOpen,
  findRoomById,
  roomActivityMs,
} from '../sessionPolicy';
import type { ChatRoomSummary } from '../types';

function room(partial: Partial<ChatRoomSummary> & { roomId: string }): ChatRoomSummary {
  return {
    roomName: 'Chat',
    ...partial,
  };
}

describe('sessionPolicy', () => {
  it('creates when there are no rooms', () => {
    expect(decideSessionOpen([])).toEqual({ action: 'create' });
  });

  it('reuses the latest room when activity is within 15 minutes', () => {
    const now = Date.now();
    const latest = room({ roomId: 'a', index: now - 5 * 60 * 1000 });
    expect(decideSessionOpen([latest], now)).toEqual({ action: 'select', room: latest });
  });

  it('creates when latest activity is older than 15 minutes and no room is empty', () => {
    const now = Date.now();
    const latest = room({
      roomId: 'a',
      index: now - CHAT_SESSION_REUSE_MS - 1000,
      lastMessage: { content: 'hi' },
    });
    expect(decideSessionOpen([latest], now)).toEqual({ action: 'create' });
  });

  it('reuses the newest empty room instead of creating when the session is stale', () => {
    const now = Date.now();
    const staleWithHistory = room({
      roomId: 'a',
      index: now - CHAT_SESSION_REUSE_MS - 1000,
      lastMessage: { content: 'hi' },
    });
    const empty = room({
      roomId: 'b',
      index: now - CHAT_SESSION_REUSE_MS - 5000,
      lastMessage: null,
    });
    expect(decideSessionOpen([staleWithHistory, empty], now)).toEqual({
      action: 'select',
      room: empty,
    });
  });

  it('creates when index is missing and the room has history', () => {
    expect(
      decideSessionOpen([room({ roomId: 'a', lastMessage: { content: 'hi' } })], Date.now())
    ).toEqual({
      action: 'create',
    });
  });

  it('finds rooms by id and reads activity ms', () => {
    const rooms = [room({ roomId: 'a', index: 10 }), room({ roomId: 'b', index: 20 })];
    expect(findRoomById(rooms, 'b')?.roomId).toBe('b');
    expect(roomActivityMs(rooms[0]!)).toBe(10);
  });
});
