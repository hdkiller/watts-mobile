import { parseE2eLoginDeepLink } from '@/src/auth/e2eLoginDeepLink';
import { setPendingE2eLogin } from '@/src/auth/pendingE2eLogin';
import { setPendingReturnPath } from '@/src/linking/pendingReturnPath';
import { resolveDeepLink } from '@/src/linking/resolveDeepLink';

/**
 * Rewrite system URLs (custom scheme + universal links) before Expo Router matches routes.
 * OAuth callback is left alone (`null`) so expo-auth-session can complete PKCE.
 * E2E fixture login is queued for AuthProvider bootstrap (not a product route).
 */
export async function redirectSystemPath({
  path,
}: {
  path: string;
  initial: boolean;
}): Promise<string | null> {
  try {
    const e2eLogin = parseE2eLoginDeepLink(path);
    if (e2eLogin) {
      await setPendingE2eLogin(e2eLogin);
      return '/';
    }

    const resolved = resolveDeepLink(path);

    if (resolved.kind === 'oauth') {
      return null;
    }

    if (resolved.kind === 'app') {
      await setPendingReturnPath(resolved.href);
      return resolved.href;
    }

    return null;
  } catch {
    return null;
  }
}
