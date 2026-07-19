import { getItemAsync, setItemAsync } from '@/src/storage/secureStorage';

import { DEFAULT_INSTANCE_URL } from './env';

const INSTANCE_KEY = 'cw.instanceBaseUrl';

export function normalizeInstanceUrl(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return '';

  let url = trimmed;
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }

  return url.replace(/\/+$/, '');
}

export async function getInstanceUrl(): Promise<string | null> {
  return getItemAsync(INSTANCE_KEY);
}

export async function setInstanceUrl(url: string): Promise<string> {
  const normalized = normalizeInstanceUrl(url);
  if (!normalized) {
    throw new Error('Instance URL is required');
  }
  await setItemAsync(INSTANCE_KEY, normalized);
  return normalized;
}

export function getDefaultInstanceUrl(): string {
  return normalizeInstanceUrl(DEFAULT_INSTANCE_URL);
}

/** Cheap reachability check before starting OAuth. */
export async function validateInstanceReachability(baseUrl: string): Promise<void> {
  const normalized = normalizeInstanceUrl(baseUrl);
  if (!normalized) {
    throw new Error('Enter a valid instance URL');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    // Public list endpoint — any non-5xx / non-network response proves reachability.
    const response = await fetch(`${normalized}/api/oauth/public-apps`, {
      method: 'GET',
      signal: controller.signal,
    });

    if (response.status >= 500) {
      throw new Error(`Instance returned HTTP ${response.status}`);
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Timed out reaching instance');
    }
    if (error instanceof Error && error.message.startsWith('Instance returned')) {
      throw error;
    }
    throw new Error('Could not reach instance — check the URL and network');
  } finally {
    clearTimeout(timeout);
  }
}
