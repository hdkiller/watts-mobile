import { onlineManager } from '@tanstack/react-query';
import { useSyncExternalStore } from 'react';

import { formatLastUpdated } from '@/src/components/OfflineBanner';

function subscribeOnline(onStoreChange: () => void): () => void {
  return onlineManager.subscribe(onStoreChange);
}

function getOnlineSnapshot(): boolean {
  return onlineManager.isOnline();
}

/** True when NetInfo reports a usable connection (via TanStack onlineManager). */
export function useIsOnline(): boolean {
  return useSyncExternalStore(subscribeOnline, getOnlineSnapshot, () => true);
}

type OfflineCachedInput = {
  /** Cached query payload (arrays/objects count even when empty). */
  data: unknown;
  isError?: boolean;
  dataUpdatedAt?: number;
};

/**
 * Show OfflineBanner when we have cached data and are offline,
 * or when a refetch failed but cache is still readable.
 */
export function useOfflineCached({ data, isError, dataUpdatedAt }: OfflineCachedInput): {
  showCachedOffline: boolean;
  lastUpdatedLabel: string | null;
  isOnline: boolean;
} {
  const isOnline = useIsOnline();
  const hasData = data !== undefined && data !== null;
  const showCachedOffline = hasData && (!isOnline || Boolean(isError));

  return {
    showCachedOffline,
    lastUpdatedLabel: formatLastUpdated(dataUpdatedAt),
    isOnline,
  };
}
