import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';

import {
  getThemePreferenceSync,
  isThemePreferenceHydrated,
  loadThemePreference,
  setThemePreference,
  subscribeThemePreference,
  type ThemePreference,
} from './themePreference';

export function useThemePreference() {
  const preference = useSyncExternalStore(
    subscribeThemePreference,
    getThemePreferenceSync,
    getThemePreferenceSync
  );
  const [ready, setReady] = useState(isThemePreferenceHydrated());

  useEffect(() => {
    let active = true;
    void loadThemePreference().then(() => {
      if (active) setReady(true);
    });
    return () => {
      active = false;
    };
  }, []);

  const setPreference = useCallback(async (next: ThemePreference) => {
    await setThemePreference(next);
  }, []);

  return { preference, ready, setPreference };
}
