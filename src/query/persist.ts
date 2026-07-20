import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { defaultShouldDehydrateQuery, type Query } from '@tanstack/react-query';

const PERSIST_KEY = 'watts.reactQuery.v1';

const ACTIVITY_PERSIST_KINDS = new Set(['upcoming', 'recent', 'planned', 'detail']);

/**
 * Persist field-companion reads so relaunch / trailhead offline still shows
 * Today, activity list→detail, chat history, inbox, profile/wellness, PMC.
 */
export function shouldPersistQuery(query: Query): boolean {
  const key = query.queryKey;
  if (!Array.isArray(key) || key.length === 0) return false;
  const root = key[0];
  if (root === 'today') return true;
  if (root === 'chat') return true;
  if (root === 'profile') return true;
  if (root === 'wellness') return true;
  if (root === 'performance') return true;
  if (root === 'notifications' && key[1] === 'inbox') return true;
  if (root === 'activity') {
    return typeof key[1] === 'string' && ACTIVITY_PERSIST_KINDS.has(key[1]);
  }
  return false;
}

/**
 * Persist allowlist + TanStack's default (success-only). Overwriting the default
 * with a key check alone dehydrates pending queries; when they reject (e.g. PMC
 * 403), hydration logs "dehydrated as pending ended up rejecting".
 */
export function shouldDehydratePersistedQuery(query: Query): boolean {
  return defaultShouldDehydrateQuery(query) && shouldPersistQuery(query);
}

export const queryPersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: PERSIST_KEY,
  throttleTime: 1000,
});

/** Drop the persisted offline cache (e.g. after switching instance URL). */
export async function clearPersistedQueryCache(): Promise<void> {
  await AsyncStorage.removeItem(PERSIST_KEY);
}
