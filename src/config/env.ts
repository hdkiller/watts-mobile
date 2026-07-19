import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra ?? {};

export const DEFAULT_INSTANCE_URL =
  process.env.EXPO_PUBLIC_DEFAULT_INSTANCE_URL ??
  (extra.defaultInstanceUrl as string | undefined) ??
  'https://coachwatts.com';

export const OAUTH_CLIENT_ID =
  process.env.EXPO_PUBLIC_OAUTH_CLIENT_ID ?? (extra.oauthClientId as string | undefined) ?? '';

export const SENTRY_DSN =
  process.env.EXPO_PUBLIC_SENTRY_DSN ?? (extra.sentryDsn as string | undefined) ?? '';

export const APP_SCHEME = 'coachwatts';
