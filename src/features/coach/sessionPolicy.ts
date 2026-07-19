import type { ChatRoomSummary } from './types';

/** Web parity (`chat.vue`): reuse last room only if active within 15 minutes. */
export const CHAT_SESSION_REUSE_MS = 15 * 60 * 1000;

export type SessionOpenDecision =
  | { action: 'select'; room: ChatRoomSummary }
  | { action: 'create' };

export function roomActivityMs(room: ChatRoomSummary): number {
  if (typeof room.index === 'number' && Number.isFinite(room.index)) {
    return room.index;
  }
  return 0;
}

/**
 * Decide whether to reopen the most recent room or create a new one.
 * Rooms must already be sorted by activity desc (API contract).
 */
export function decideSessionOpen(
  rooms: ChatRoomSummary[],
  nowMs: number = Date.now()
): SessionOpenDecision {
  const lastRoom = rooms[0];
  if (!lastRoom?.roomId) {
    return { action: 'create' };
  }
  const lastActivity = roomActivityMs(lastRoom);
  if (!lastActivity || nowMs - lastActivity > CHAT_SESSION_REUSE_MS) {
    return { action: 'create' };
  }
  return { action: 'select', room: lastRoom };
}

export function findRoomById(
  rooms: ChatRoomSummary[],
  roomId: string | null | undefined
): ChatRoomSummary | undefined {
  if (!roomId) return undefined;
  return rooms.find((room) => room.roomId === roomId);
}
