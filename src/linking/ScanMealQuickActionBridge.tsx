import { router } from 'expo-router';
import { useQuickActionRouting } from 'expo-quick-actions/router';
import { useCallback } from 'react';

import { APP_HREFS } from '@/src/linking/appHrefs';

const SCAN_MEAL_ACTION_ID = 'scan-meal';

/**
 * Bridges iOS home-screen "Scan Meal" (and any quick action with action=camera)
 * into Log with a fresh one-shot token. Mount under an authenticated sub-layout.
 */
export function ScanMealQuickActionBridge() {
  const onQuickAction = useCallback((action: { id?: string; params?: Record<string, unknown> | null }) => {
    const id = typeof action.id === 'string' ? action.id : '';
    const href =
      action.params && typeof action.params.href === 'string' ? action.params.href : '';
    const isScanMeal =
      id === SCAN_MEAL_ACTION_ID ||
      href.includes('action=camera') ||
      href.includes('scan-meal');

    if (!isScanMeal) return false;

    router.push({
      pathname: APP_HREFS.log,
      params: { action: 'camera', t: String(Date.now()) },
    });
    return true;
  }, []);

  useQuickActionRouting(onQuickAction);

  return null;
}
