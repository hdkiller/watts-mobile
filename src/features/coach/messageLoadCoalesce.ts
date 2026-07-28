export type MessageLoadRequest = {
  roomId: string;
  silent: boolean;
};

/**
 * Record a load request while another fetch is in flight.
 * Latest room wins; any non-silent request forces the follow-up to show loading.
 * Silent loads for a room that is no longer active are ignored so a poll tick
 * captured before a room switch cannot displace the pending UI load.
 */
export function coalescePendingLoad(
  pending: MessageLoadRequest | null,
  next: MessageLoadRequest,
  activeRoomId: string | null,
): MessageLoadRequest | null {
  if (next.silent && activeRoomId && next.roomId !== activeRoomId) {
    return pending;
  }
  if (!pending) return next;
  if (pending.roomId === next.roomId) {
    return { roomId: next.roomId, silent: pending.silent && next.silent };
  }
  if (!next.silent) return next;
  if (!pending.silent) return pending;
  if (activeRoomId === next.roomId) return next;
  if (activeRoomId === pending.roomId) return pending;
  return next;
}

/**
 * After a fetch settles, decide whether another load is required.
 * Prefers the latest pending id, then the active room when it differs from
 * the request that just finished.
 */
export function resolveFollowUpLoad(args: {
  pending: MessageLoadRequest | null;
  activeRoomId: string | null;
  completedRoomId: string;
}): MessageLoadRequest | null {
  const { pending, activeRoomId, completedRoomId } = args;

  if (pending) {
    if (activeRoomId && pending.roomId !== activeRoomId) {
      if (completedRoomId !== activeRoomId) {
        return { roomId: activeRoomId, silent: false };
      }
      return null;
    }
    return pending;
  }

  if (activeRoomId && activeRoomId !== completedRoomId) {
    return { roomId: activeRoomId, silent: false };
  }

  return null;
}

/** Ignore fetches that finished after a newer load generation or room switch. */
export function shouldApplyMessageLoad(args: {
  isActive: boolean;
  requestGeneration: number;
  currentGeneration: number;
  requestedRoomId: string;
  activeRoomId: string | null;
}): boolean {
  return (
    args.isActive &&
    args.requestGeneration === args.currentGeneration &&
    args.activeRoomId === args.requestedRoomId
  );
}
