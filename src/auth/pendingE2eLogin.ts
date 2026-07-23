import { deleteItemAsync, getItemAsync, setItemAsync } from '@/src/storage/secureStorage';

const STORAGE_KEY = 'pending_e2e_login_v1';

export type PendingE2eLogin = {
  email: string;
  instanceUrl: string;
};

let memory: PendingE2eLogin | null = null;

function parseStored(raw: string | null): PendingE2eLogin | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as PendingE2eLogin;
    if (
      typeof parsed?.email === 'string' &&
      parsed.email.trim() &&
      typeof parsed?.instanceUrl === 'string' &&
      parsed.instanceUrl.trim()
    ) {
      return {
        email: parsed.email.trim(),
        instanceUrl: parsed.instanceUrl.trim(),
      };
    }
  } catch {
    /* ignore corrupt payload */
  }
  return null;
}

export async function setPendingE2eLogin(payload: PendingE2eLogin): Promise<void> {
  memory = payload;
  await setItemAsync(STORAGE_KEY, JSON.stringify(payload));
}

/** Non-destructive read (for AuthProvider wake-ups after openLink). */
export async function loadPendingE2eLogin(): Promise<PendingE2eLogin | null> {
  if (memory) return memory;
  const stored = parseStored(await getItemAsync(STORAGE_KEY));
  memory = stored;
  return stored;
}

export async function consumePendingE2eLogin(): Promise<PendingE2eLogin | null> {
  const pending = memory ?? parseStored(await getItemAsync(STORAGE_KEY));
  memory = null;
  await deleteItemAsync(STORAGE_KEY);
  return pending;
}

export async function clearPendingE2eLogin(): Promise<void> {
  memory = null;
  await deleteItemAsync(STORAGE_KEY);
}
