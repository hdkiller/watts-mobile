import { getAuthSessionGeneration } from '@/src/auth/authSessionGeneration';
import { deleteItemAsync, getItemAsync, setItemAsync } from '@/src/storage/secureStorage';

const ACCESS_KEY = 'cw.accessToken';
const REFRESH_KEY = 'cw.refreshToken';
const EXPIRES_KEY = 'cw.accessExpiresAt';
/** Auth session generation that last wrote tokens — used to ignore stale clears. */
const SESSION_GEN_KEY = 'cw.authSessionGeneration';

export type StoredTokens = {
  accessToken: string;
  refreshToken: string | null;
  /** Epoch ms when access token should be treated as expired */
  accessExpiresAt: number | null;
};

/**
 * Persist tokens. Explicit `null` clears that field; `undefined` preserves the prior value
 * (used by refresh rotation when the server omits a new refresh token / expiry).
 */
export async function saveTokens(tokens: {
  accessToken: string;
  refreshToken?: string | null;
  expiresIn?: number | null;
}): Promise<StoredTokens> {
  const sessionGeneration = getAuthSessionGeneration();
  await setItemAsync(ACCESS_KEY, tokens.accessToken);
  await setItemAsync(SESSION_GEN_KEY, String(sessionGeneration));

  if (tokens.refreshToken !== undefined) {
    if (tokens.refreshToken) {
      await setItemAsync(REFRESH_KEY, tokens.refreshToken);
    } else {
      await deleteItemAsync(REFRESH_KEY);
    }
  }

  let accessExpiresAt: number | null;
  if (tokens.expiresIn !== undefined) {
    if (typeof tokens.expiresIn === 'number' && Number.isFinite(tokens.expiresIn)) {
      accessExpiresAt = Date.now() + tokens.expiresIn * 1000;
      await setItemAsync(EXPIRES_KEY, String(accessExpiresAt));
    } else {
      accessExpiresAt = null;
      await deleteItemAsync(EXPIRES_KEY);
    }
  } else {
    const expiresRaw = await getItemAsync(EXPIRES_KEY);
    accessExpiresAt = expiresRaw ? Number(expiresRaw) : null;
  }

  const refreshToken =
    tokens.refreshToken !== undefined ? tokens.refreshToken : await getItemAsync(REFRESH_KEY);

  return {
    accessToken: tokens.accessToken,
    refreshToken,
    accessExpiresAt,
  };
}

export async function loadTokens(): Promise<StoredTokens | null> {
  const accessToken = await getItemAsync(ACCESS_KEY);
  if (!accessToken) return null;

  const refreshToken = await getItemAsync(REFRESH_KEY);
  const expiresRaw = await getItemAsync(EXPIRES_KEY);

  return {
    accessToken,
    refreshToken,
    accessExpiresAt: expiresRaw ? Number(expiresRaw) : null,
  };
}

/**
 * Clear tokens. When `expectedGeneration` is set, skip if SecureStore already holds a
 * newer login's tokens (stale failAuthSession must not wipe a fresh session).
 */
export async function clearTokens(expectedGeneration?: number): Promise<void> {
  if (expectedGeneration !== undefined) {
    const storedGenRaw = await getItemAsync(SESSION_GEN_KEY);
    if (storedGenRaw != null && storedGenRaw !== '') {
      const storedGen = Number(storedGenRaw);
      if (Number.isFinite(storedGen) && storedGen !== expectedGeneration) {
        return;
      }
    }
    if (expectedGeneration !== getAuthSessionGeneration()) {
      return;
    }
  }

  await deleteItemAsync(ACCESS_KEY);
  await deleteItemAsync(REFRESH_KEY);
  await deleteItemAsync(EXPIRES_KEY);
  await deleteItemAsync(SESSION_GEN_KEY);
}
