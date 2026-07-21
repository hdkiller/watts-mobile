import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_PREFIX = 'watts.activation.connectLater.v2.';
const LEGACY_STORAGE_KEY = 'watts.activation.connectLater.v1';

const memory = new Map<string, boolean>();
const hydrated = new Set<string>();

export function activationIdentity(
  instanceUrl: string | null | undefined,
  user: { sub?: string; email?: string | null } | null | undefined
): string | null {
  const account = user?.sub || user?.email;
  if (!instanceUrl || !account) return null;
  return `${instanceUrl.replace(/\/$/, '')}|${account}`;
}

function storageKey(identity: string): string {
  return `${STORAGE_PREFIX}${encodeURIComponent(identity)}`;
}

async function ensureHydrated(identity: string): Promise<void> {
  if (hydrated.has(identity)) return;
  const key = storageKey(identity);
  try {
    let raw = await AsyncStorage.getItem(key);
    if (raw == null) {
      raw = await AsyncStorage.getItem(LEGACY_STORAGE_KEY);
      if (raw === '1' || raw === 'true') {
        await AsyncStorage.setItem(key, '1');
      }
      await AsyncStorage.removeItem(LEGACY_STORAGE_KEY);
    }
    memory.set(identity, raw === '1' || raw === 'true');
  } catch {
    memory.set(identity, false);
  }
  hydrated.add(identity);
}

export async function getConnectLater(identity?: string | null): Promise<boolean> {
  if (!identity) return false;
  await ensureHydrated(identity);
  return memory.get(identity) ?? false;
}

export async function setConnectLater(identity: string, value: boolean): Promise<void> {
  await ensureHydrated(identity);
  memory.set(identity, value);
  const key = storageKey(identity);
  if (value) {
    await AsyncStorage.setItem(key, '1');
  } else {
    await AsyncStorage.removeItem(key);
  }
}

export async function clearConnectLater(identity?: string | null): Promise<void> {
  if (identity) {
    memory.delete(identity);
    hydrated.delete(identity);
    await AsyncStorage.removeItem(storageKey(identity));
    return;
  }

  const keys = await AsyncStorage.getAllKeys();
  const activationKeys = keys.filter(
    (key) => key === LEGACY_STORAGE_KEY || key.startsWith(STORAGE_PREFIX)
  );
  if (activationKeys.length > 0) {
    await AsyncStorage.multiRemove(activationKeys);
  }
  memory.clear();
  hydrated.clear();
}
