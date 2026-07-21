import AsyncStorage from '@react-native-async-storage/async-storage';

import { lookbackStartDate } from './mapToWellnessPayload';
import type { HealthPlatform, HealthReadWindow, SyncLedgerKind, SyncWatermark } from './types';
import { LOOKBACK_DAYS, WATERMARK_OVERLAP_MS } from './types';

const STORAGE_KEY = 'watts.health.watermarks.v1';

type WatermarkStore = Partial<Record<`${HealthPlatform}:${SyncLedgerKind}`, SyncWatermark>>;

let memory: WatermarkStore = {};
let hydrated = false;
let hydrationPromise: Promise<void> | null = null;

/** Lazy Platform read so unit tests can import this module without RN. */
function currentPlatform(): HealthPlatform | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Platform } = require('react-native') as typeof import('react-native');
    if (Platform.OS === 'ios') return 'healthkit';
    if (Platform.OS === 'android') return 'health_connect';
  } catch {
    // node / vitest
  }
  return null;
}

function key(source: HealthPlatform, kind: SyncLedgerKind): `${HealthPlatform}:${SyncLedgerKind}` {
  return `${source}:${kind}`;
}

async function ensureHydrated(): Promise<void> {
  if (hydrated) return;
  if (!hydrationPromise) {
    hydrationPromise = (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          memory = JSON.parse(raw) as WatermarkStore;
        }
      } catch {
        memory = {};
      }
      hydrated = true;
    })().finally(() => {
      hydrationPromise = null;
    });
  }
  return hydrationPromise;
}

async function persist(): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(memory));
}

export async function getWatermark(
  kind: SyncLedgerKind,
  source: HealthPlatform = currentPlatform() ?? 'healthkit'
): Promise<SyncWatermark | undefined> {
  await ensureHydrated();
  return memory[key(source, kind)];
}

export async function setWatermark(
  kind: SyncLedgerKind,
  lastReadThrough: string,
  source: HealthPlatform = currentPlatform() ?? 'healthkit'
): Promise<void> {
  await ensureHydrated();
  memory[key(source, kind)] = { source, kind, lastReadThrough };
  await persist();
}

export async function clearWatermarks(): Promise<void> {
  memory = {};
  hydrated = true;
  await AsyncStorage.removeItem(STORAGE_KEY);
}

/**
 * Resolve the read window for a sync pass.
 * Full lookback when no watermark / fullResync; otherwise watermark − overlap.
 */
export async function resolveReadWindow(
  kind: SyncLedgerKind,
  options: { fullResync?: boolean; lookbackDays?: number } = {}
): Promise<HealthReadWindow> {
  const lookbackDays = options.lookbackDays ?? LOOKBACK_DAYS;
  if (options.fullResync) {
    return { lookbackDays };
  }
  const source = currentPlatform();
  if (!source) return { lookbackDays };

  const mark = await getWatermark(kind, source);
  if (!mark?.lastReadThrough) {
    return { lookbackDays };
  }

  const watermarkMs = new Date(mark.lastReadThrough).getTime();
  if (!Number.isFinite(watermarkMs)) {
    return { lookbackDays };
  }

  let from = new Date(watermarkMs - WATERMARK_OVERLAP_MS);
  if (kind === 'wellness') {
    const previousDay = new Date();
    previousDay.setDate(previousDay.getDate() - 1);
    previousDay.setHours(0, 0, 0, 0);
    if (previousDay.getTime() < from.getTime()) from = previousDay;
  }
  const lookbackStart = lookbackStartDate(lookbackDays);
  // Never read earlier than the configured lookback cap.
  return { from: from.getTime() < lookbackStart.getTime() ? lookbackStart : from, lookbackDays };
}

/** Test helper */
export function _resetWatermarksForTests(): void {
  memory = {};
  hydrated = false;
  hydrationPromise = null;
}
