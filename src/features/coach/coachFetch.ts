import { fetch as expoFetch } from 'expo/fetch';

import { notifyAuthFailure, singleFlightRefresh } from '@/src/api/client';
import { clearTokens, loadTokens } from '@/src/auth/tokenStorage';
import { getInstanceUrl } from '@/src/config/instance';

async function failAuthSession(): Promise<void> {
  await clearTokens();
  notifyAuthFailure();
}

/**
 * Streaming-capable fetch for AI SDK transport.
 * Uses expo/fetch (required for RN stream parsing) + Bearer auth / refresh.
 * Shares single-flight refresh with `apiFetch` so parallel 401s don't rotate the same token twice.
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

  if (response.status !== 401) {
    return response;
  }

  if (!tokens?.refreshToken) {
    await failAuthSession();
    return response;
  }

  try {
    const refreshed = await singleFlightRefresh(instanceBaseUrl, tokens.refreshToken);
    const retryHeaders = new Headers(init?.headers);
    if (!retryHeaders.has('Accept')) {
      retryHeaders.set('Accept', 'text/plain, application/json');
    }
    retryHeaders.set('Authorization', `Bearer ${refreshed.accessToken}`);
    const retry = await expoFetch(url, { ...init, headers: retryHeaders });
    if (retry.status === 401) {
      await failAuthSession();
    }
    return retry;
  } catch {
    await failAuthSession();
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
