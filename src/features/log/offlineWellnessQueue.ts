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

export async function enqueueWellnessCheckin(payload: WellnessUploadPayload): Promise<void> {
  const pending: PendingWellnessCheckin = { payload, queuedAt: Date.now() };
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(pending));
}

export async function clearPendingWellnessCheckin(): Promise<void> {
  await AsyncStorage.removeItem(QUEUE_KEY);
}

/** Flush at most one pending check-in. Returns true if a payload was synced. */
export async function flushPendingWellnessCheckin(): Promise<boolean> {
  if (!onlineManager.isOnline()) return false;
  const pending = await loadPendingWellnessCheckin();
  if (!pending) return false;
  await saveWellnessCheckin(pending.payload);
  await clearPendingWellnessCheckin();
  return true;
}
