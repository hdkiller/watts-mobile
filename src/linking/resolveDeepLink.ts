import {
  APP_HREFS,
  logCameraHref,
  migrateLegacyAppHref,
  PAYWALL_QUERY_KEYS,
  paywallHref,
  type PaywallQueryKey,
} from '@/src/linking/appHrefs';
import {
  APP_SCHEME,
  OAUTH_CALLBACK_PATH,
  PUSH_TYPE_DEFAULT_PATHS,
  UNIVERSAL_LINK_PREFIX,
  type PushEventType,
} from '@/src/linking/pathMap';

export type DeepLinkKind = 'oauth' | 'app' | 'unknown';

export type ResolvedDeepLink =
  | { kind: 'oauth' }
  | { kind: 'app'; href: string; canonicalPath: string }
  | { kind: 'unknown'; reason: string };

export function extractDeepLinkPath(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)) {
    try {
      const url = new URL(trimmed);
      const protocol = url.protocol.replace(/:$/, '').toLowerCase();

      if (protocol === APP_SCHEME) {
        const host = url.hostname || url.host;
        const joined = host ? `/${host}${url.pathname === '/' ? '' : url.pathname}` : url.pathname;
        return normalizePathname(joined);
      }

      if (protocol === 'https' || protocol === 'http') {
        return normalizePathname(stripUniversalPrefix(url.pathname));
      }

      if (protocol === 'exp') {
        const marker = '/--/';
        const idx = trimmed.indexOf(marker);
        if (idx >= 0) {
          return normalizePathname(trimmed.slice(idx + marker.length));
        }
      }
    } catch {
      return null;
    }
  }

  return normalizePathname(stripUniversalPrefix(trimmed));
}

/** Raw `?a=b&c=d` (no `#fragment`) substring of a bare path/URL string, or '' if none. */
function rawQueryString(raw: string): string {
  const qIdx = raw.indexOf('?');
  if (qIdx < 0) return '';
  const rest = raw.slice(qIdx);
  const hashIdx = rest.indexOf('#');
  return hashIdx >= 0 ? rest.slice(0, hashIdx) : rest;
}

/**
 * Mirrors `extractDeepLinkPath`'s parsing branches to recover the query string
 * alongside the matched path, so allowlisted params (e.g. paywall `feature`/
 * `source`) can survive path resolution instead of being dropped.
 */
function extractDeepLinkQuery(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return '';

  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)) {
    try {
      const url = new URL(trimmed);
      const protocol = url.protocol.replace(/:$/, '').toLowerCase();

      if (protocol === APP_SCHEME || protocol === 'https' || protocol === 'http') {
        return url.search;
      }

      if (protocol === 'exp') {
        const marker = '/--/';
        const idx = trimmed.indexOf(marker);
        if (idx >= 0) {
          return rawQueryString(trimmed.slice(idx + marker.length));
        }
      }
    } catch {
      return '';
    }
  }

  return rawQueryString(trimmed);
}

/** Builds a paywall href keeping only the allowlisted query keys from `query`. */
function resolvePaywallHref(query: string): string {
  if (!query) return APP_HREFS.paywall;
  const params = new URLSearchParams(query);
  const allowed: Partial<Record<PaywallQueryKey, string>> = {};
  for (const key of PAYWALL_QUERY_KEYS) {
    const value = params.get(key);
    if (value) allowed[key] = value;
  }
  return paywallHref(allowed);
}

function stripUniversalPrefix(pathname: string): string {
  const normalized = pathname.startsWith('/') ? pathname : `/${pathname}`;
  if (normalized === UNIVERSAL_LINK_PREFIX || normalized.startsWith(`${UNIVERSAL_LINK_PREFIX}/`)) {
    const rest = normalized.slice(UNIVERSAL_LINK_PREFIX.length) || '/';
    return rest.startsWith('/') ? rest : `/${rest}`;
  }
  return normalized;
}

function normalizePathname(pathname: string): string {
  const withoutQuery = pathname.split('?')[0]?.split('#')[0] ?? '';
  let path = withoutQuery.startsWith('/') ? withoutQuery : `/${withoutQuery}`;
  path = path.replace(/\/{2,}/g, '/');
  if (path.length > 1 && path.endsWith('/')) {
    path = path.slice(0, -1);
  }
  return path || '/';
}

export function resolveDeepLinkPath(pathname: string, query = ''): ResolvedDeepLink {
  const path = normalizePathname(pathname);

  if (path === OAUTH_CALLBACK_PATH || path.startsWith(`${OAUTH_CALLBACK_PATH}/`)) {
    return { kind: 'oauth' };
  }

  if (path === '/today' || path === '/today/recommendation') {
    return { kind: 'app', href: APP_HREFS.today, canonicalPath: path };
  }

  const recommendationMatch = path.match(/^\/recommendations\/([^/]+)$/);
  if (recommendationMatch) {
    return { kind: 'app', href: APP_HREFS.today, canonicalPath: path };
  }

  const plannedMatch = path.match(/^\/planned\/([^/]+)$/);
  if (plannedMatch?.[1]) {
    return {
      kind: 'app',
      href: APP_HREFS.plannedDetail(plannedMatch[1]),
      canonicalPath: path,
    };
  }

  if (path === '/activities') {
    return { kind: 'app', href: APP_HREFS.activityList, canonicalPath: path };
  }

  const activityMatch = path.match(/^\/activities\/([^/]+)$/);
  if (activityMatch?.[1]) {
    return {
      kind: 'app',
      href: APP_HREFS.activityDetail(activityMatch[1]),
      canonicalPath: path,
    };
  }

  if (path === '/upcoming') {
    return { kind: 'app', href: APP_HREFS.upcoming, canonicalPath: path };
  }

  // `/paywall?feature=…&source=…` so a limit notification can open the contextual
  // upgrade with the right copy/analytics context — allowlisted params survive.
  if (path === '/paywall' || path === '/upgrade') {
    return { kind: 'app', href: resolvePaywallHref(query), canonicalPath: path };
  }

  if (path === '/plan' || path === '/plans') {
    return { kind: 'app', href: APP_HREFS.plan, canonicalPath: path };
  }

  if (path === '/events') {
    return { kind: 'app', href: APP_HREFS.eventsList, canonicalPath: path };
  }

  const eventMatch = path.match(/^\/events\/([^/]+)$/);
  if (eventMatch?.[1]) {
    return {
      kind: 'app',
      href: APP_HREFS.eventDetail(eventMatch[1]),
      canonicalPath: path,
    };
  }

  if (path === '/coach' || path === '/chat') {
    return { kind: 'app', href: APP_HREFS.coach, canonicalPath: path };
  }

  const chatMatch = path.match(/^\/chat\/([^/]+)$/);
  if (chatMatch?.[1]) {
    const roomId = decodeURIComponent(chatMatch[1]);
    return {
      kind: 'app',
      href: `${APP_HREFS.coach}?roomId=${encodeURIComponent(roomId)}`,
      canonicalPath: path,
    };
  }

  if (path === '/notifications') {
    return { kind: 'app', href: APP_HREFS.notifications, canonicalPath: path };
  }

  if (
    path === '/scan-meal' ||
    path === '/camera' ||
    path === '/log/camera' ||
    path === '/log/scan-meal'
  ) {
    return {
      kind: 'app',
      href: logCameraHref() as any,
      canonicalPath: path,
    };
  }

  if (path === '/log') {
    return { kind: 'app', href: APP_HREFS.log, canonicalPath: path };
  }

  if (path === '/more') {
    return { kind: 'app', href: APP_HREFS.more, canonicalPath: path };
  }

  return { kind: 'unknown', reason: `No route mapping for ${path}` };
}

export function resolveDeepLink(input: string): ResolvedDeepLink {
  const path = extractDeepLinkPath(input);
  if (!path) {
    return { kind: 'unknown', reason: 'Empty or unparseable link' };
  }
  return resolveDeepLinkPath(path, extractDeepLinkQuery(input));
}

export type PushNavigationData = {
  path?: string | null;
  url?: string | null;
  type?: string | null;
};

export function resolvePushNavigation(data: PushNavigationData): ResolvedDeepLink {
  const fromPath = data.path?.trim();
  if (fromPath) {
    // Server may send Expo Router hrefs (e.g. recommend-today RECOMMENDATION_READY).
    if (fromPath.startsWith('/(app)')) {
      const href = migrateLegacyAppHref(fromPath);
      return { kind: 'app', href, canonicalPath: fromPath };
    }
    return resolveDeepLink(fromPath);
  }

  const fromUrl = data.url?.trim();
  if (fromUrl) {
    return resolveDeepLink(fromUrl);
  }

  const type = data.type?.trim() as PushEventType | undefined;
  if (type && type in PUSH_TYPE_DEFAULT_PATHS) {
    return resolveDeepLinkPath(PUSH_TYPE_DEFAULT_PATHS[type]);
  }

  return { kind: 'unknown', reason: 'Push payload missing path/url/type' };
}

export function redirectSystemPathForNativeIntent(path: string): string | null {
  const resolved = resolveDeepLink(path);
  if (resolved.kind === 'oauth') {
    return null;
  }
  if (resolved.kind === 'app') {
    return resolved.href;
  }
  return null;
}
