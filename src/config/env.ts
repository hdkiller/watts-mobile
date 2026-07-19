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

export const SENTRY_DSN =
  process.env.EXPO_PUBLIC_SENTRY_DSN ?? (extraString('sentryDsn') || '');

/** Optional release name for Sentry (EAS can set via EXPO_PUBLIC_SENTRY_RELEASE). */
export const SENTRY_RELEASE =
  process.env.EXPO_PUBLIC_SENTRY_RELEASE ?? (extraString('sentryRelease') || undefined);

export const SENTRY_DIST =
  process.env.EXPO_PUBLIC_SENTRY_DIST ?? (extraString('sentryDist') || undefined);

export const SENTRY_ENVIRONMENT =
  process.env.EXPO_PUBLIC_SENTRY_ENVIRONMENT ??
  (extraString('sentryEnvironment') || (__DEV__ ? 'development' : 'production'));

export const APP_SCHEME = 'coachwatts';

export const APP_VERSION = Constants.expoConfig?.version ?? '0.1.0';
