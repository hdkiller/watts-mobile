import { deleteItemAsync, getItemAsync, setItemAsync } from '@/src/storage/secureStorage';

const ACCESS_KEY = 'cw.accessToken';
const REFRESH_KEY = 'cw.refreshToken';
const EXPIRES_KEY = 'cw.accessExpiresAt';

export type StoredTokens = {
  accessToken: string;
  refreshToken: string | null;
  /** Epoch ms when access token should be treated as expired */
  accessExpiresAt: number | null;
};

export async function saveTokens(tokens: {
  accessToken: string;
  refreshToken?: string | null;
  expiresIn?: number | null;
}): Promise<StoredTokens> {
  const accessExpiresAt =
    typeof tokens.expiresIn === 'number' ? Date.now() + tokens.expiresIn * 1000 : null;

  await setItemAsync(ACCESS_KEY, tokens.accessToken);

  if (tokens.refreshToken) {
    await setItemAsync(REFRESH_KEY, tokens.refreshToken);
  }

  if (accessExpiresAt != null) {
    await setItemAsync(EXPIRES_KEY, String(accessExpiresAt));
  }

  const refreshToken =
    tokens.refreshToken !== undefined
      ? tokens.refreshToken
      : await getItemAsync(REFRESH_KEY);

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

export async function clearTokens(): Promise<void> {
  await deleteItemAsync(ACCESS_KEY);
  await deleteItemAsync(REFRESH_KEY);
  await deleteItemAsync(EXPIRES_KEY);
}
