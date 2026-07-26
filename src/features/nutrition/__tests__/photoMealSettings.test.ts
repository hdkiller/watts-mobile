import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  getPhotoSourceModeSync,
  getSavePhotoToLibrarySync,
  isPhotoMealSettingsHydrated,
  loadPhotoMealSettings,
  photoSourceModeLabel,
  setPhotoSourceMode,
  setSavePhotoToLibrary,
  subscribePhotoMealSettings,
} from '../photoMealSettings';

vi.mock('@react-native-async-storage/async-storage', () => {
  const store = new Map<string, string>();
  return {
    default: {
      getItem: vi.fn(async (key: string) => store.get(key) ?? null),
      setItem: vi.fn(async (key: string, value: string) => {
        store.set(key, value);
      }),
      removeItem: vi.fn(async (key: string) => {
        store.delete(key);
      }),
    },
  };
});

describe('photoMealSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads default photo meal settings when uninitialized', async () => {
    const settings = await loadPhotoMealSettings();
    expect(settings.sourceMode).toBe('ask');
    expect(settings.saveToLibrary).toBe(false);
    expect(isPhotoMealSettingsHydrated()).toBe(true);
  });

  it('updates and persists photo source mode', async () => {
    const listener = vi.fn();
    const unsubscribe = subscribePhotoMealSettings(listener);

    await setPhotoSourceMode('camera');
    expect(getPhotoSourceModeSync()).toBe('camera');
    expect(listener).toHaveBeenCalled();

    unsubscribe();
  });

  it('updates and persists save photo to library setting', async () => {
    await setSavePhotoToLibrary(true);
    expect(getSavePhotoToLibrarySync()).toBe(true);
  });

  it('provides user-friendly labels for photo source modes', () => {
    expect(photoSourceModeLabel('ask')).toBe('Ask every time');
    expect(photoSourceModeLabel('camera')).toBe('Always open Camera');
    expect(photoSourceModeLabel('library')).toBe('Always open Photo Library');
  });
});
