import { saveTokens } from '@/src/auth/tokenStorage';
import {
  E2E_ACCESS_TOKEN,
  E2E_ALLOW_ANY_HOST,
  E2E_ALLOWED_HOSTS,
  E2E_AUTH_ENABLED,
  E2E_INSTANCE_URL,
  E2E_REFRESH_TOKEN,
} from '@/src/config/env';
import { normalizeInstanceUrl, setInstanceUrl } from '@/src/config/instance';

/** Hosts allowed when e2e auth seeds an instance URL (loopback / emulator aliases). */
const DEFAULT_ALLOWED_HOSTS = new Set(['localhost', '127.0.0.1', '10.0.2.2']);

export type E2eAuthSeedResult = {
  instanceUrl: string;
  accessToken: string;
};

export function isE2eAuthEnabled(): boolean {
  return E2E_AUTH_ENABLED;
}

export function isE2eInstanceHostAllowed(instanceUrl: string): boolean {
  if (E2E_ALLOW_ANY_HOST) return true;

  let hostname: string;
  try {
    hostname = new URL(normalizeInstanceUrl(instanceUrl)).hostname.toLowerCase();
  } catch {
    return false;
  }

  if (DEFAULT_ALLOWED_HOSTS.has(hostname)) return true;
  return E2E_ALLOWED_HOSTS.some((host) => host === hostname);
}

/**
 * When `EXPO_PUBLIC_E2E_AUTH=1`, persist fixture instance + tokens so smoke tests
 * skip the system-browser PKCE flow. Never enable on store/production profiles.
 */
export async function applyE2eAuthSeed(): Promise<E2eAuthSeedResult | null> {
  if (!isE2eAuthEnabled()) return null;

  const instanceInput = E2E_INSTANCE_URL.trim();
  if (!instanceInput) {
    throw new Error(
      'E2E auth enabled but EXPO_PUBLIC_E2E_INSTANCE_URL (or EXPO_PUBLIC_DEFAULT_INSTANCE_URL) is empty'
    );
  }

  if (!isE2eInstanceHostAllowed(instanceInput)) {
    throw new Error(
      `E2E auth refused instance host for ${instanceInput}. Use localhost / 127.0.0.1 / 10.0.2.2, or set EXPO_PUBLIC_E2E_ALLOWED_HOSTS / EXPO_PUBLIC_E2E_ALLOW_ANY_HOST=1`
    );
  }

  const accessToken = E2E_ACCESS_TOKEN.trim();
  if (!accessToken) {
    throw new Error('E2E auth enabled but EXPO_PUBLIC_E2E_ACCESS_TOKEN is empty');
  }

  const instanceUrl = await setInstanceUrl(instanceInput);
  await saveTokens({
    accessToken,
    refreshToken: E2E_REFRESH_TOKEN.trim() || null,
  });

  return { instanceUrl, accessToken };
}
