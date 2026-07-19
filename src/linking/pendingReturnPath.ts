import { deleteItemAsync, getItemAsync, setItemAsync } from '@/src/storage/secureStorage';

const STORAGE_KEY = 'pending_deep_link_href';

/** In-memory cache so cold-start can read before SecureStore resolves. */
let memoryHref: string | null = null;

export function peekPendingReturnPath(): string | null {
  return memoryHref;
}

export async function setPendingReturnPath(href: string): Promise<void> {
  memoryHref = href;
  await setItemAsync(STORAGE_KEY, href);
}

export async function loadPendingReturnPath(): Promise<string | null> {
  if (memoryHref) return memoryHref;
  const stored = await getItemAsync(STORAGE_KEY);
  memoryHref = stored;
  return stored;
}

/** Read and clear the pending return path (after successful auth navigation). */
export async function consumePendingReturnPath(): Promise<string | null> {
  const href = memoryHref ?? (await getItemAsync(STORAGE_KEY));
  memoryHref = null;
  await deleteItemAsync(STORAGE_KEY);
  return href;
}

export async function clearPendingReturnPath(): Promise<void> {
  memoryHref = null;
  await deleteItemAsync(STORAGE_KEY);
}
