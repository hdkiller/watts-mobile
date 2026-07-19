import { setPendingReturnPath } from '@/src/linking/pendingReturnPath';
import { resolveDeepLink } from '@/src/linking/resolveDeepLink';

/**
 * Rewrite system URLs (custom scheme + universal links) before Expo Router matches routes.
 * OAuth callback is left alone (`null`) so expo-auth-session can complete PKCE.
 */
export async function redirectSystemPath({
  path,
}: {
  path: string;
  initial: boolean;
}): Promise<string | null> {
  try {
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
