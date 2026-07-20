import { refreshAccessToken } from '@/src/auth/oauth';
import { clearTokens, loadTokens, type StoredTokens } from '@/src/auth/tokenStorage';
import { getInstanceUrl } from '@/src/config/instance';

export type UserInfo = {
  sub?: string;
  name?: string | null;
  email?: string | null;
  picture?: string | null;
};

type ApiFetchOptions = RequestInit & {
  skipAuth?: boolean;
};

let refreshPromise: Promise<StoredTokens> | null = null;
let onAuthFailure: (() => void) | null = null;

export function setAuthFailureHandler(handler: (() => void) | null) {
  onAuthFailure = handler;
}

/** Invoke the registered AuthContext failure handler (e.g. from coachChatFetch). */
export function notifyAuthFailure(): void {
  onAuthFailure?.();
}

function resolveUrl(instanceBaseUrl: string, path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  if (normalizedPath.startsWith('/api/')) {
    return `${instanceBaseUrl}${normalizedPath}`;
  }
  return `${instanceBaseUrl}/api${normalizedPath}`;
}

/** Shared single-flight refresh — use from apiFetch and coachChatFetch to avoid parallel rotations. */
export async function singleFlightRefresh(
  instanceBaseUrl: string,
  refreshToken: string
): Promise<StoredTokens> {
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken({ instanceBaseUrl, refreshToken }).finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

async function failAuthSession(): Promise<void> {
  await clearTokens();
  onAuthFailure?.();
}

export async function apiFetch(path: string, options: ApiFetchOptions = {}): Promise<Response> {
  const instanceBaseUrl = await getInstanceUrl();
  if (!instanceBaseUrl) {
    throw new Error('Instance URL is not configured');
  }

  const url = resolveUrl(instanceBaseUrl, path);
  const headers = new Headers(options.headers);
  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }

  if (!options.skipAuth) {
    const tokens = await loadTokens();
    if (tokens?.accessToken) {
      headers.set('Authorization', `Bearer ${tokens.accessToken}`);
    }
  }

  const response = await fetch(url, { ...options, headers });

  if (response.status !== 401 || options.skipAuth) {
    return response;
  }

  const tokens = await loadTokens();
  if (!tokens?.refreshToken) {
    await failAuthSession();
    return response;
  }

  try {
    const refreshed = await singleFlightRefresh(instanceBaseUrl, tokens.refreshToken);
    const retryHeaders = new Headers(options.headers);
    if (!retryHeaders.has('Accept')) {
      retryHeaders.set('Accept', 'application/json');
    }
    retryHeaders.set('Authorization', `Bearer ${refreshed.accessToken}`);
    const retry = await fetch(url, { ...options, headers: retryHeaders });
    if (retry.status === 401) {
      await failAuthSession();
    }
    return retry;
  } catch {
    await failAuthSession();
    return response;
  }
}

export async function fetchUserInfo(): Promise<UserInfo> {
  const response = await apiFetch('/api/oauth/userinfo');
  if (!response.ok) {
    throw new Error(`userinfo failed (${response.status})`);
  }
  return (await response.json()) as UserInfo;
}
