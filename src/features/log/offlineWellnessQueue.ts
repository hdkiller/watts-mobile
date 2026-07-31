import AsyncStorage from '@react-native-async-storage/async-storage';
import { onlineManager } from '@tanstack/react-query';

import { saveWellnessCheckin } from './api';
import type { WellnessUploadPayload } from './types';

const QUEUE_KEY = 'watts.offline.wellnessCheckin.v1';

export type PendingWellnessCheckin = {
  payload: WellnessUploadPayload;
  queuedAt: number;
};

export async function loadPendingWellnessCheckin(): Promise<PendingWellnessCheckin | null> {
  try {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingWellnessCheckin;
    if (!parsed?.payload?.date) return null;
    return parsed;
  } catch {
    return null;
  }
}

// `Date.now()` alone can collide when two check-ins are queued within the
// same millisecond (e.g. a save arriving while a flush's POST is in flight).
// A monotonic per-process counter as a tiebreaker guarantees each enqueue
// gets a strictly increasing `queuedAt`, so `clearIfUnchanged` below can
// reliably tell "still the entry we flushed" from "a newer one arrived".
let queuedAtSequence = 0;
function nextQueuedAt(): number {
  queuedAtSequence = (queuedAtSequence + 1) % 1000;
  return Date.now() * 1000 + queuedAtSequence;
}

export async function enqueueWellnessCheckin(payload: WellnessUploadPayload): Promise<void> {
  const pending: PendingWellnessCheckin = { payload, queuedAt: nextQueuedAt() };
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(pending));
}

export async function clearPendingWellnessCheckin(): Promise<void> {
  await AsyncStorage.removeItem(QUEUE_KEY);
}

/**
 * Clear the queued check-in, but only if it is still the same entry that was
 * just flushed (matched by `queuedAt`). If a newer check-in was queued while
 * the flush was in flight, leave it in place so it gets flushed next time.
 */
async function clearIfUnchanged(flushedQueuedAt: number): Promise<void> {
  const current = await loadPendingWellnessCheckin();
  if (current && current.queuedAt !== flushedQueuedAt) {
    // A newer check-in was queued while we were flushing; don't drop it.
    return;
  }
  await clearPendingWellnessCheckin();
}

/** Flush at most one pending check-in. Returns true if a payload was synced. */
export async function flushPendingWellnessCheckin(): Promise<boolean> {
  if (!onlineManager.isOnline()) return false;
  const pending = await loadPendingWellnessCheckin();
  if (!pending) return false;
  await saveWellnessCheckin(pending.payload);
  await clearIfUnchanged(pending.queuedAt);
  return true;
}
