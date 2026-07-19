import AsyncStorage from '@react-native-async-storage/async-storage';

export type LogSection = 'recovery' | 'wellness' | 'nutrition' | 'measurements';

/** Device preference for which Log segment opens by default. */
export type LogTabPreference =
  | 'auto'
  | 'nutrition'
  | 'recovery'
  | 'wellness'
  | 'measurements';

const STORAGE_KEY = 'watts.log.defaultTab.v1';

let memoryPreference: LogTabPreference = 'auto';
let hydrated = false;
const listeners = new Set<() => void>();

function isLogTabPreference(value: unknown): value is LogTabPreference {
  return (
    value === 'auto' ||
    value === 'nutrition' ||
    value === 'recovery' ||
    value === 'wellness' ||
    value === 'measurements'
  );
}

async function ensureHydrated(): Promise<void> {
  if (hydrated) return;
  const previous = memoryPreference;
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw && isLogTabPreference(raw)) {
      memoryPreference = raw;
    }
  } catch {
    // Ignore corrupt storage — keep auto.
  }
  hydrated = true;
  if (memoryPreference !== previous) notify();
}

function notify() {
  for (const listener of listeners) listener();
}

export async function loadLogTabPreference(): Promise<LogTabPreference> {
  await ensureHydrated();
  return memoryPreference;
}

export function getLogTabPreferenceSync(): LogTabPreference {
  return memoryPreference;
}

export function isLogTabPreferenceHydrated(): boolean {
  return hydrated;
}

export async function setLogTabPreference(next: LogTabPreference): Promise<void> {
  await ensureHydrated();
  memoryPreference = next;
  notify();
  await AsyncStorage.setItem(STORAGE_KEY, next);
}

export function subscribeLogTabPreference(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Segment order in the Log chrome. */
export function logTabOrder(nutritionEnabled: boolean): LogSection[] {
  return nutritionEnabled
    ? ['nutrition', 'recovery', 'wellness', 'measurements']
    : ['recovery', 'wellness', 'measurements'];
}

/** Resolve which tab to open when no `?section=` deep link is present. */
export function resolveDefaultLogTab(
  preference: LogTabPreference,
  nutritionEnabled: boolean
): LogSection {
  if (preference === 'wellness') return 'wellness';
  if (preference === 'recovery') return 'recovery';
  if (preference === 'measurements') return 'measurements';
  if (preference === 'nutrition') {
    return nutritionEnabled ? 'nutrition' : 'recovery';
  }
  // auto
  return nutritionEnabled ? 'nutrition' : 'recovery';
}

export function logTabPreferenceLabel(
  preference: LogTabPreference,
  nutritionEnabled: boolean
): string {
  if (preference === 'auto') {
    return nutritionEnabled ? 'Automatic (Nutrition)' : 'Automatic (Recovery)';
  }
  if (preference === 'nutrition') return 'Nutrition';
  if (preference === 'recovery') return 'Recovery';
  if (preference === 'measurements') return 'Measurements';
  return 'Wellness';
}

/** Test helper */
export function _resetLogTabPreferenceForTests(): void {
  memoryPreference = 'auto';
  hydrated = false;
  listeners.clear();
}
