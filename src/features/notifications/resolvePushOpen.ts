import { migrateLegacyAppHref } from '@/src/linking/appHrefs';
import {
  resolvePushNavigation,
  type PushNavigationData,
  type ResolvedDeepLink,
} from '@/src/linking/resolveDeepLink';

export type { PushNavigationData, ResolvedDeepLink };

/**
 * Resolve where a notification open should land.
 * Prefers `data.path` / `data.url`, then type→default; also accepts Expo Router
 * hrefs the server may send (e.g. `/(app)/(tabs)/today` from recommend-today).
 */
export function resolvePushOpen(data: PushNavigationData | null | undefined): ResolvedDeepLink {
  if (!data) {
    return { kind: 'unknown', reason: 'Missing push data' };
  }

  const path = data.path?.trim();
  if (path?.startsWith('/(app)')) {
    const href = migrateLegacyAppHref(path);
    return { kind: 'app', href, canonicalPath: path };
  }

  const url = data.url?.trim();
  if (url?.startsWith('/(app)')) {
    const href = migrateLegacyAppHref(url);
    return { kind: 'app', href, canonicalPath: url };
  }

  return resolvePushNavigation(data);
}

export function pushDataFromNotificationContent(
  data: Record<string, unknown> | undefined | null
): PushNavigationData {
  if (!data) return {};
  return {
    path: typeof data.path === 'string' ? data.path : null,
    url: typeof data.url === 'string' ? data.url : null,
    type: typeof data.type === 'string' ? data.type : null,
  };
}
