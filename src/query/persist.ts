import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import type { Query } from '@tanstack/react-query';

const PERSIST_KEY = 'watts.reactQuery.v1';

/** Persist Today + planned detail (+ supporting lists used offline on those screens). */
export function shouldPersistQuery(query: Query): boolean {
  const key = query.queryKey;
  if (!Array.isArray(key) || key.length === 0) return false;
  const root = key[0];
  if (root === 'today') return true;
  if (root === 'activity') {
    const kind = key[1];
    return kind === 'upcoming' || kind === 'recent' || kind === 'planned';
  }
  return false;
}

export const queryPersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: PERSIST_KEY,
  throttleTime: 1000,
});
