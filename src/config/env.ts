import Constants from 'expo-constants';

const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, unknown>;

function extraString(key: string): string {
  const value = extra[key];
  return typeof value === 'string' ? value : '';
}

export const DEFAULT_INSTANCE_URL =
  process.env.EXPO_PUBLIC_DEFAULT_INSTANCE_URL ??
  (extraString('defaultInstanceUrl') || 'https://coachwatts.com');

export const OAUTH_CLIENT_ID =
  process.env.EXPO_PUBLIC_OAUTH_CLIENT_ID ?? (extraString('oauthClientId') || '');

function envFlag(value: string | undefined): boolean {
  if (!value) return false;
  const normalized = value.trim().toLowerCase();
  return normalized === '1' || normalized === 'true' || normalized === 'yes';
}

function envCsv(value: string | undefined): string[] {
  if (!value?.trim()) return [];
  return value
    .split(',')
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Maestro / local smoke only. When set, bootstrap seeds SecureStore tokens and
 * skips system-browser PKCE. Never enable on store or production EAS profiles.
 */
export const E2E_AUTH_ENABLED = envFlag(process.env.EXPO_PUBLIC_E2E_AUTH);

/** Instance base URL for e2e seed (no `/api` suffix). Defaults to DEFAULT_INSTANCE_URL. */
export const E2E_INSTANCE_URL =
  process.env.EXPO_PUBLIC_E2E_INSTANCE_URL?.trim() || DEFAULT_INSTANCE_URL;

export const E2E_ACCESS_TOKEN = process.env.EXPO_PUBLIC_E2E_ACCESS_TOKEN ?? '';

export const E2E_REFRESH_TOKEN = process.env.EXPO_PUBLIC_E2E_REFRESH_TOKEN ?? '';

/** Extra hostnames allowed for e2e instance URLs (comma-separated). */
export const E2E_ALLOWED_HOSTS = envCsv(process.env.EXPO_PUBLIC_E2E_ALLOWED_HOSTS);

/** Escape hatch for hosted staging e2e — prefer ALLOWED_HOSTS instead. */
export const E2E_ALLOW_ANY_HOST = envFlag(process.env.EXPO_PUBLIC_E2E_ALLOW_ANY_HOST);

export const SENTRY_DSN =
  process.env.EXPO_PUBLIC_SENTRY_DSN ?? (extraString('sentryDsn') || '');

/** Optional release name for Sentry (EAS can set via EXPO_PUBLIC_SENTRY_RELEASE). */
export const SENTRY_RELEASE =
  process.env.EXPO_PUBLIC_SENTRY_RELEASE ?? (extraString('sentryRelease') || undefined);

export const SENTRY_DIST =
  process.env.EXPO_PUBLIC_SENTRY_DIST ?? (extraString('sentryDist') || undefined);

const isDev =
  (typeof __DEV__ !== 'undefined' && __DEV__) ||
  process.env.NODE_ENV === 'development';

export const SENTRY_ENVIRONMENT =
  process.env.EXPO_PUBLIC_SENTRY_ENVIRONMENT ??
  (extraString('sentryEnvironment') || (isDev ? 'development' : 'production'));

export const APP_SCHEME = 'coachwatts';

export const APP_VERSION = Constants.expoConfig?.version ?? '0.1.0';

/**
 * Android Google Maps key (baked into the native binary via app.config).
 * iOS uses Apple Maps and does not need this. Prefer GOOGLE_MAPS_API_KEY at
 * prebuild time; EXPO_PUBLIC_GOOGLE_MAPS_API_KEY is accepted for EAS parity.
 */
export const GOOGLE_MAPS_API_KEY =
  process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() ||
  process.env.GOOGLE_MAPS_API_KEY?.trim() ||
  extraString('googleMapsApiKey') ||
  (
    Constants.expoConfig?.android?.config as
      | { googleMaps?: { apiKey?: string } }
      | undefined
  )?.googleMaps?.apiKey?.trim() ||
  '';
