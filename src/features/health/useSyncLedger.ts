import { useEffect, useSyncExternalStore } from 'react';

import {
  getSyncLedgerSync,
  loadSyncLedger,
  subscribeSyncLedger,
} from './ledger';

export function useSyncLedger() {
  const items = useSyncExternalStore(subscribeSyncLedger, getSyncLedgerSync, getSyncLedgerSync);

  useEffect(() => {
    void loadSyncLedger();
  }, []);

  return items;
}
