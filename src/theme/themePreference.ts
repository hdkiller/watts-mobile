import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';

/** Device preference for app appearance. Default follows the OS. */
export type ThemePreference = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'watts.theme.preference.v1';

let memoryPreference: ThemePreference = 'system';
let hydrated = false;
const listeners = new Set<() => void>();

function isThemePreference(value: unknown): value is ThemePreference {
  return value === 'system' || value === 'light' || value === 'dark';
}

/** Map stored preference → React Native Appearance override. */
export function appearanceSchemeForPreference(
  preference: ThemePreference
): 'light' | 'dark' | 'unspecified' {
  if (preference === 'light') return 'light';
  if (preference === 'dark') return 'dark';
  return 'unspecified';
}

/** Apply preference to the running app (CSS variables + JS theme hooks follow). */
export function applyThemePreference(preference: ThemePreference): void {
  Appearance.setColorScheme(appearanceSchemeForPreference(preference));
}

async function ensureHydrated(): Promise<void> {
  if (hydrated) return;
  const previous = memoryPreference;
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw && isThemePreference(raw)) {
      memoryPreference = raw;
    }
  } catch {
    // Ignore corrupt storage — keep system.
  }
  hydrated = true;
  if (memoryPreference !== previous) notify();
}

function notify() {
  for (const listener of listeners) listener();
}

export async function loadThemePreference(): Promise<ThemePreference> {
  await ensureHydrated();
  applyThemePreference(memoryPreference);
  return memoryPreference;
}

export function getThemePreferenceSync(): ThemePreference {
  return memoryPreference;
}

export function isThemePreferenceHydrated(): boolean {
  return hydrated;
}

export async function setThemePreference(next: ThemePreference): Promise<void> {
  await ensureHydrated();
  memoryPreference = next;
  applyThemePreference(next);
  notify();
  await AsyncStorage.setItem(STORAGE_KEY, next);
}

export function subscribeThemePreference(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function themePreferenceLabel(preference: ThemePreference): string {
  if (preference === 'light') return 'Light';
  if (preference === 'dark') return 'Dark';
  return 'System';
}

/** Test helper */
export function _resetThemePreferenceForTests(): void {
  memoryPreference = 'system';
  hydrated = false;
  listeners.clear();
}
