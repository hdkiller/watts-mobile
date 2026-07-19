import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';

import {
  getLogTabPreferenceSync,
  isLogTabPreferenceHydrated,
  loadLogTabPreference,
  setLogTabPreference,
  subscribeLogTabPreference,
  type LogTabPreference,
} from './logTabPreference';

export function useLogTabPreference() {
  const preference = useSyncExternalStore(
    subscribeLogTabPreference,
    getLogTabPreferenceSync,
    getLogTabPreferenceSync
  );
  const [ready, setReady] = useState(isLogTabPreferenceHydrated());

  useEffect(() => {
    let active = true;
    void loadLogTabPreference().then(() => {
      if (active) setReady(true);
    });
    return () => {
      active = false;
    };
  }, []);

  const setPreference = useCallback(async (next: LogTabPreference) => {
    await setLogTabPreference(next);
  }, []);

  return { preference, ready, setPreference };
}
