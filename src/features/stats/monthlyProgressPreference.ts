import AsyncStorage from '@react-native-async-storage/async-storage';

import type { MonthlyMetric } from './types';

const STORAGE_KEY = 'watts.stats.monthlyProgress.metric.v1';

const METRICS: readonly MonthlyMetric[] = [
  'tss',
  'duration',
  'distance',
  'elevation',
  'count',
];

let memoryMetric: MonthlyMetric = 'tss';
let hydrated = false;
const listeners = new Set<() => void>();

function isMonthlyMetric(value: unknown): value is MonthlyMetric {
  return typeof value === 'string' && (METRICS as readonly string[]).includes(value);
}

function notify() {
  for (const listener of listeners) listener();
}

async function ensureHydrated(): Promise<void> {
  if (hydrated) return;
  const previous = memoryMetric;
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw && isMonthlyMetric(raw)) {
      memoryMetric = raw;
    }
  } catch {
    // Ignore corrupt storage — keep default TSS.
  }
  hydrated = true;
  if (memoryMetric !== previous) notify();
}

export async function loadMonthlyProgressMetric(): Promise<MonthlyMetric> {
  await ensureHydrated();
  return memoryMetric;
}

export function getMonthlyProgressMetricSync(): MonthlyMetric {
  return memoryMetric;
}

export function isMonthlyProgressMetricHydrated(): boolean {
  return hydrated;
}

export async function setMonthlyProgressMetric(next: MonthlyMetric): Promise<void> {
  await ensureHydrated();
  memoryMetric = next;
  notify();
  await AsyncStorage.setItem(STORAGE_KEY, next);
}

export function subscribeMonthlyProgressMetric(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function monthlyMetricLabel(metric: MonthlyMetric): string {
  switch (metric) {
    case 'duration':
      return 'Duration';
    case 'distance':
      return 'Distance';
    case 'elevation':
      return 'Elevation';
    case 'count':
      return 'Count';
    default:
      return 'TSS';
  }
}

/** Test helper */
export function _resetMonthlyProgressMetricForTests(): void {
  memoryMetric = 'tss';
  hydrated = false;
  listeners.clear();
}
