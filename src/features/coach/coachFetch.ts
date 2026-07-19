import { fetch as expoFetch } from 'expo/fetch';

import { refreshAccessToken } from '@/src/auth/oauth';
import { clearTokens, loadTokens } from '@/src/auth/tokenStorage';
import { getInstanceUrl } from '@/src/config/instance';

/**
 * Streaming-capable fetch for AI SDK transport.
 * Uses expo/fetch (required for RN stream parsing) + Bearer auth / refresh.
 */
export async function coachChatFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const instanceBaseUrl = await getInstanceUrl();
  if (!instanceBaseUrl) {
    throw new Error('Instance URL is not configured');
  }

  const url = typeof input === 'string' || input instanceof URL ? String(input) : input.url;
  const headers = new Headers(init?.headers);
  if (!headers.has('Accept')) {
    headers.set('Accept', 'text/plain, application/json');
  }

  const tokens = await loadTokens();
  if (tokens?.accessToken) {
    headers.set('Authorization', `Bearer ${tokens.accessToken}`);
  }

  const response = await expoFetch(url, { ...init, headers });

  if (response.status !== 401 || !tokens?.refreshToken) {
    return response;
  }

  try {
    const refreshed = await refreshAccessToken({
      instanceBaseUrl,
      refreshToken: tokens.refreshToken,
    });
    const retryHeaders = new Headers(init?.headers);
    if (!retryHeaders.has('Accept')) {
      retryHeaders.set('Accept', 'text/plain, application/json');
    }
    retryHeaders.set('Authorization', `Bearer ${refreshed.accessToken}`);
    return expoFetch(url, { ...init, headers: retryHeaders });
  } catch {
    await clearTokens();
    return response;
  }
}

export async function resolveChatMessagesApiUrl(): Promise<string> {
  const instanceBaseUrl = await getInstanceUrl();
  if (!instanceBaseUrl) {
    throw new Error('Instance URL is not configured');
  }
  return `${instanceBaseUrl.replace(/\/+$/, '')}/api/chat/messages`;
}
