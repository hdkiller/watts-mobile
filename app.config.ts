import type { ConfigContext, ExpoConfig } from 'expo/config';

/**
 * Dynamic Expo config. Static chrome lives in `app.json`; env/EAS injects
 * release observability without committing secrets.
 */
export default ({ config }: ConfigContext): ExpoConfig => {
  const extra = (config.extra ?? {}) as Record<string, unknown>;

  return {
    ...config,
    name: config.name ?? 'Coach Watts',
    slug: config.slug ?? 'coach-watts-app',
    extra: {
      ...extra,
      sentryDsn: process.env.EXPO_PUBLIC_SENTRY_DSN ?? extra.sentryDsn ?? '',
      sentryEnvironment:
        process.env.EXPO_PUBLIC_SENTRY_ENVIRONMENT ??
        (process.env.EAS_BUILD === 'true' ? 'production' : 'development'),
      sentryRelease:
        process.env.EXPO_PUBLIC_SENTRY_RELEASE ??
        process.env.EAS_BUILD_ID ??
        undefined,
      sentryDist: process.env.EXPO_PUBLIC_SENTRY_DIST ?? process.env.EAS_BUILD_NUMBER ?? undefined,
    },
  } as ExpoConfig;
};
