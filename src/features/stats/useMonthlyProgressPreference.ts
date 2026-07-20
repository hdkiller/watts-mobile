import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';

import {
  getMonthlyProgressMetricSync,
  isMonthlyProgressMetricHydrated,
  loadMonthlyProgressMetric,
  setMonthlyProgressMetric,
  subscribeMonthlyProgressMetric,
} from './monthlyProgressPreference';
import type { MonthlyMetric } from './types';

export function useMonthlyProgressMetric() {
  const metric = useSyncExternalStore(
    subscribeMonthlyProgressMetric,
    getMonthlyProgressMetricSync,
    getMonthlyProgressMetricSync
  );
  const [ready, setReady] = useState(isMonthlyProgressMetricHydrated());

  useEffect(() => {
    let active = true;
    void loadMonthlyProgressMetric().then(() => {
      if (active) setReady(true);
    });
    return () => {
      active = false;
    };
  }, []);

  const setMetric = useCallback(async (next: MonthlyMetric) => {
    await setMonthlyProgressMetric(next);
  }, []);

  return { metric, ready, setMetric };
}
