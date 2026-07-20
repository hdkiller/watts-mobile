import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('react-native', () => ({
  Appearance: {
    setColorScheme: vi.fn(),
  },
}));

vi.mock('@react-native-async-storage/async-storage', () => {
  let store = new Map<string, string>();
  return {
    default: {
      getItem: vi.fn(async (key: string) => store.get(key) ?? null),
      setItem: vi.fn(async (key: string, value: string) => {
        store.set(key, value);
      }),
      removeItem: vi.fn(async (key: string) => {
        store.delete(key);
      }),
      clear: vi.fn(async () => {
        store = new Map();
      }),
    },
  };
});

import { Appearance } from 'react-native';

import {
  _resetThemePreferenceForTests,
  appearanceSchemeForPreference,
  loadThemePreference,
  setThemePreference,
  themePreferenceLabel,
} from '../themePreference';

describe('themePreference', () => {
  beforeEach(async () => {
    _resetThemePreferenceForTests();
    vi.mocked(Appearance.setColorScheme).mockClear();
    const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
    await AsyncStorage.clear();
  });

  it('maps preference to Appearance schemes', () => {
    expect(appearanceSchemeForPreference('system')).toBe('unspecified');
    expect(appearanceSchemeForPreference('light')).toBe('light');
    expect(appearanceSchemeForPreference('dark')).toBe('dark');
  });

  it('labels preferences for settings detail', () => {
    expect(themePreferenceLabel('system')).toBe('System');
    expect(themePreferenceLabel('light')).toBe('Light');
    expect(themePreferenceLabel('dark')).toBe('Dark');
  });

  it('persists and applies a preference', async () => {
    await setThemePreference('light');
    expect(Appearance.setColorScheme).toHaveBeenCalledWith('light');

    _resetThemePreferenceForTests();
    vi.mocked(Appearance.setColorScheme).mockClear();

    const loaded = await loadThemePreference();
    expect(loaded).toBe('light');
    expect(Appearance.setColorScheme).toHaveBeenCalledWith('light');
  });

  it('defaults to system when storage is empty', async () => {
    const loaded = await loadThemePreference();
    expect(loaded).toBe('system');
    expect(Appearance.setColorScheme).toHaveBeenCalledWith('unspecified');
  });
});
