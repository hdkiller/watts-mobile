import { consumePendingE2eLogin } from '@/src/auth/pendingE2eLogin';
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

export type MintedE2eToken = {
  accessToken: string;
  refreshToken: string | null;
};

export function isE2eAuthEnabled(): boolean {
  return E2E_AUTH_ENABLED;
}

function isPrivateLanHostname(hostname: string): boolean {
  // Dev-only escape hatch: Simulator sometimes cannot use host loopback tunnels;
  // Maestro can pass the Mac LAN IP (same path as Metro) when 127.0.0.1 hangs.
  if (!__DEV__) return false;
  if (hostname === '0.0.0.0') return false;
  const parts = hostname.split('.').map((p) => Number(p));
  if (parts.length !== 4 || parts.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) {
    return false;
  }
  const [a, b] = parts;
  if (a === 10) return true;
  if (a === 192 && b === 168) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  return false;
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
  if (isPrivateLanHostname(hostname)) return true;
  return E2E_ALLOWED_HOSTS.some((host) => host === hostname);
}

/** Simulator fetch to `localhost` can hang on IPv6 (::1); prefer loopback v4. */
function rewriteLoopbackInstanceUrl(instanceUrlInput: string): string {
  return normalizeInstanceUrl(instanceUrlInput).replace(
    /^(https?:\/\/)localhost(?=[:/]|$)/i,
    '$1127.0.0.1'
  );
}

/**
 * Mint a fixture Bearer from coach-wattz `POST /api/__e2e/token`.
 * Only allowlisted instance hosts (loopback / emulator).
 */
export async function mintE2eToken(
  instanceUrlInput: string,
  email: string
): Promise<MintedE2eToken> {
  if (!isE2eInstanceHostAllowed(instanceUrlInput)) {
    throw new Error(
      `E2E login refused instance host for ${instanceUrlInput}. Use localhost / 127.0.0.1 / 10.0.2.2, or set EXPO_PUBLIC_E2E_ALLOWED_HOSTS / EXPO_PUBLIC_E2E_ALLOW_ANY_HOST=1`
    );
  }

  const instanceUrl = rewriteLoopbackInstanceUrl(instanceUrlInput);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);

  try {
    const response = await fetch(`${instanceUrl}/api/__e2e/token`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({ email }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`E2E token mint failed (HTTP ${response.status})`);
    }

    const body = (await response.json()) as {
      access_token?: unknown;
      refresh_token?: unknown;
    };
    const accessToken =
      typeof body.access_token === 'string' ? body.access_token.trim() : '';
    if (!accessToken) {
      throw new Error('E2E token mint returned no access_token');
    }

    return {
      accessToken,
      refreshToken:
        typeof body.refresh_token === 'string' && body.refresh_token.trim()
          ? body.refresh_token.trim()
          : null,
    };
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('E2E token mint timed out');
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Consume a pending `coachwatts://e2e/login` intent: mint + persist instance/tokens.
 */
export async function applyPendingE2eLogin(): Promise<E2eAuthSeedResult | null> {
  const pending = await consumePendingE2eLogin();
  if (!pending) return null;

  const loopbackInstance = rewriteLoopbackInstanceUrl(pending.instanceUrl);
  const minted = await mintE2eToken(loopbackInstance, pending.email);
  const instanceUrl = await setInstanceUrl(loopbackInstance);
  await saveTokens({
    accessToken: minted.accessToken,
    refreshToken: minted.refreshToken,
  });

  return { instanceUrl, accessToken: minted.accessToken };
}

/**
 * When `EXPO_PUBLIC_E2E_AUTH=1`, persist fixture instance + tokens so smoke tests
 * skip the system-browser PKCE flow. Prefer deep-link login for local Maestro.
 * Never enable on store/production profiles.
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

  const instanceUrl = await setInstanceUrl(rewriteLoopbackInstanceUrl(instanceInput));
  await saveTokens({
    accessToken,
    refreshToken: E2E_REFRESH_TOKEN.trim() || null,
  });

  return { instanceUrl, accessToken };
}
