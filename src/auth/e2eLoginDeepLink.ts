import { APP_SCHEME } from '@/src/linking/pathMap';

/** Default fixture athlete on coach-wattz e2e seed. */
export const DEFAULT_E2E_LOGIN_EMAIL = 'e2e-athlete@coachwatts.test';

/** iOS Simulator → host e2e stack (see docs/e2e.md). Prefer 127.0.0.1 over localhost (IPv6 ::1 hangs). */
export const DEFAULT_E2E_LOGIN_INSTANCE_URL = 'http://127.0.0.1:3199';

export type ParsedE2eLoginDeepLink = {
  email: string;
  instanceUrl: string;
};

/**
 * Parse `coachwatts://e2e/login?email=&instance=` (or path-only `/e2e/login?…`).
 * Returns null when the URL is not an e2e login link.
 */
export function parseE2eLoginDeepLink(input: string): ParsedE2eLoginDeepLink | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  let url: URL;
  try {
    if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)) {
      url = new URL(trimmed);
    } else {
      const path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
      url = new URL(`${APP_SCHEME}://${path.replace(/^\//, '')}`);
    }
  } catch {
    return null;
  }

  const protocol = url.protocol.replace(/:$/, '').toLowerCase();
  if (protocol !== APP_SCHEME && protocol !== 'http' && protocol !== 'https') {
    // Path-only synthetic URL uses coachwatts; ignore unrelated schemes.
    if (protocol !== APP_SCHEME) return null;
  }

  const host = url.hostname || url.host;
  const pathFromHost = host ? `/${host}${url.pathname === '/' ? '' : url.pathname}` : url.pathname;
  const path = (pathFromHost.split('?')[0] ?? '').replace(/\/{2,}/g, '/') || '/';
  const normalized =
    path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path;

  if (normalized !== '/e2e/login') {
    return null;
  }

  const email = (url.searchParams.get('email') ?? DEFAULT_E2E_LOGIN_EMAIL).trim();
  const instanceUrl = (
    url.searchParams.get('instance') ?? DEFAULT_E2E_LOGIN_INSTANCE_URL
  ).trim();

  if (!email || !instanceUrl) return null;

  return { email, instanceUrl };
}

/** Canonical Maestro / local openLink target (iOS Simulator). */
export function e2eLoginDeepLinkUrl(options?: {
  email?: string;
  instanceUrl?: string;
}): string {
  const email = encodeURIComponent(options?.email ?? DEFAULT_E2E_LOGIN_EMAIL);
  const instance = encodeURIComponent(
    options?.instanceUrl ?? DEFAULT_E2E_LOGIN_INSTANCE_URL
  );
  return `${APP_SCHEME}://e2e/login?email=${email}&instance=${instance}`;
}
