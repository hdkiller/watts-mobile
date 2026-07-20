import type { ConfigContext, ExpoConfig } from 'expo/config';

/**
 * Dynamic Expo config. Static chrome lives in `app.json`; env/EAS injects
 * release observability without committing secrets.
 *
 * Set `IOS_FREE_TEAM=1` before `expo prebuild` / `expo run:ios` to strip
 * paid Apple capabilities (Push, Associated Domains, HealthKit, App Groups /
 * widgets) so a free Personal Team can install on a physical device.
 * Simulator and paid-team builds should omit the flag (full app).
 */
export default ({ config }: ConfigContext): ExpoConfig => {
  const extra = (config.extra ?? {}) as Record<string, unknown>;
  const iosFreeTeam = isTruthyEnv(process.env.IOS_FREE_TEAM);

  const ios = { ...(config.ios ?? {}) };
  let plugins = [...(config.plugins ?? [])];

  if (iosFreeTeam) {
    delete ios.associatedDomains;

    const entitlements = { ...(ios.entitlements ?? {}) } as Record<string, unknown>;
    delete entitlements['com.apple.developer.healthkit'];
    delete entitlements['com.apple.developer.healthkit.access'];
    delete entitlements['com.apple.developer.healthkit.background-delivery'];
    ios.entitlements = Object.keys(entitlements).length > 0 ? entitlements : undefined;

    plugins = plugins.filter((entry) => {
      const name = pluginName(entry);
      return (
        name !== 'expo-notifications' &&
        name !== 'expo-widgets' &&
        name !== '@kingstinct/react-native-healthkit'
      );
    });
    plugins.push('./plugins/withIosFreeTeamStrip');
  }

  return {
    ...config,
    name: config.name ?? 'Coach Watts',
    slug: config.slug ?? 'coach-watts-app',
    ios,
    plugins,
    extra: {
      ...extra,
      iosFreeTeam,
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

function isTruthyEnv(value: string | undefined): boolean {
  if (!value) return false;
  const normalized = value.trim().toLowerCase();
  return normalized === '1' || normalized === 'true' || normalized === 'yes';
}

function pluginName(entry: NonNullable<ExpoConfig['plugins']>[number]): string | null {
  if (typeof entry === 'string') return entry;
  if (Array.isArray(entry) && typeof entry[0] === 'string') return entry[0];
  return null;
}
