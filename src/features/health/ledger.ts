import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  applyLedgerRetention,
  sortLedgerNewestFirst,
  upsertLedgerItem,
} from './ledgerHelpers';
import type { SyncLedgerItem } from './types';

const STORAGE_KEY = 'watts.health.ledger.v1';

let memory: SyncLedgerItem[] = [];
/** Cached newest-first view — stable between mutations for useSyncExternalStore. */
let snapshot: SyncLedgerItem[] = [];
let hydrated = false;
const listeners = new Set<() => void>();

function refreshSnapshot() {
  snapshot = sortLedgerNewestFirst(memory);
}

function notify() {
  for (const listener of listeners) listener();
}

let hydrationPromise: Promise<void> | null = null;

async function ensureHydrated(): Promise<void> {
  if (hydrated) return;
  if (!hydrationPromise) {
    hydrationPromise = (async () => {
      let next: SyncLedgerItem[];
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as SyncLedgerItem[];
          next = Array.isArray(parsed) ? applyLedgerRetention(parsed) : [];
        } else {
          next = [];
        }
      } catch {
        next = [];
      }
      // A write (persist/clear) that landed while we were reading wins.
      if (hydrated) return;
      memory = next;
      refreshSnapshot();
      hydrated = true;
      notify();
    })().finally(() => {
      hydrationPromise = null;
    });
  }
  return hydrationPromise;
}

async function persist(): Promise<void> {
  memory = applyLedgerRetention(memory);
  refreshSnapshot();
  notify();
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(memory));
}

export async function loadSyncLedger(): Promise<SyncLedgerItem[]> {
  await ensureHydrated();
  return snapshot;
}

/** Stable snapshot for useSyncExternalStore — must not allocate a new array each call. */
export function getSyncLedgerSync(): SyncLedgerItem[] {
  return snapshot;
}

export function subscribeSyncLedger(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export async function getLedgerItem(id: string): Promise<SyncLedgerItem | undefined> {
  await ensureHydrated();
  return memory.find((i) => i.id === id);
}

export async function saveLedgerItem(item: SyncLedgerItem): Promise<SyncLedgerItem> {
  await ensureHydrated();
  memory = upsertLedgerItem(memory, item);
  await persist();
  return item;
}

export async function clearSyncLedger(): Promise<void> {
  memory = [];
  refreshSnapshot();
  hydrated = true;
  notify();
  await AsyncStorage.removeItem(STORAGE_KEY);
}

/** Test helper */
export function _resetSyncLedgerForTests(): void {
  memory = [];
  snapshot = [];
  hydrated = false;
  hydrationPromise = null;
  listeners.clear();
}
