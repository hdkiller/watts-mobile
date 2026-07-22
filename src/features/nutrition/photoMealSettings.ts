import AsyncStorage from '@react-native-async-storage/async-storage';

export type PhotoSourceMode = 'ask' | 'camera' | 'library';

const MODE_STORAGE_KEY = 'watts.nutrition.photoSourceMode.v1';
const SAVE_LIBRARY_STORAGE_KEY = 'watts.nutrition.savePhotoToLibrary.v1';

let memorySourceMode: PhotoSourceMode = 'ask';
let memorySaveToLibrary = false;
let hydrated = false;
const listeners = new Set<() => void>();

function isPhotoSourceMode(value: unknown): value is PhotoSourceMode {
  return value === 'ask' || value === 'camera' || value === 'library';
}

async function ensureHydrated(): Promise<void> {
  if (hydrated) return;
  try {
    const [rawMode, rawSave] = await Promise.all([
      AsyncStorage.getItem(MODE_STORAGE_KEY),
      AsyncStorage.getItem(SAVE_LIBRARY_STORAGE_KEY),
    ]);
    if (rawMode && isPhotoSourceMode(rawMode)) {
      memorySourceMode = rawMode;
    }
    if (rawSave !== null) {
      memorySaveToLibrary = rawSave === 'true';
    }
  } catch {
    // Keep defaults
  }
  hydrated = true;
  notify();
}

function notify() {
  for (const listener of listeners) listener();
}

export async function loadPhotoMealSettings(): Promise<{
  sourceMode: PhotoSourceMode;
  saveToLibrary: boolean;
}> {
  await ensureHydrated();
  return { sourceMode: memorySourceMode, saveToLibrary: memorySaveToLibrary };
}

export function getPhotoSourceModeSync(): PhotoSourceMode {
  return memorySourceMode;
}

export function getSavePhotoToLibrarySync(): boolean {
  return memorySaveToLibrary;
}

export function isPhotoMealSettingsHydrated(): boolean {
  return hydrated;
}

export function subscribePhotoMealSettings(listener: () => void): () => void {
  listeners.add(listener);
  void ensureHydrated();
  return () => {
    listeners.delete(listener);
  };
}

export async function setPhotoSourceMode(mode: PhotoSourceMode): Promise<void> {
  await ensureHydrated();
  memorySourceMode = mode;
  notify();
  try {
    await AsyncStorage.setItem(MODE_STORAGE_KEY, mode);
  } catch {
    // Ignore storage write error
  }
}

export async function setSavePhotoToLibrary(save: boolean): Promise<void> {
  await ensureHydrated();
  memorySaveToLibrary = save;
  notify();
  try {
    await AsyncStorage.setItem(SAVE_LIBRARY_STORAGE_KEY, String(save));
  } catch {
    // Ignore storage write error
  }
}

export function photoSourceModeLabel(mode: PhotoSourceMode): string {
  if (mode === 'ask') return 'Ask every time';
  if (mode === 'camera') return 'Always open Camera';
  if (mode === 'library') return 'Always open Photo Library';
  return 'Ask every time';
}
