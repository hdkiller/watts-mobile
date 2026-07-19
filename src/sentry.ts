import {
  APP_VERSION,
  SENTRY_DIST,
  SENTRY_DSN,
  SENTRY_ENVIRONMENT,
  SENTRY_RELEASE,
} from '@/src/config/env';

export function initSentry() {
  if (!SENTRY_DSN) return;

  // Lazy require so builds without a DSN stay lightweight.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Sentry = require('@sentry/react-native') as typeof import('@sentry/react-native');
  Sentry.init({
    dsn: SENTRY_DSN,
    tracesSampleRate: 0.1,
    enableAutoSessionTracking: true,
    environment: SENTRY_ENVIRONMENT,
    release: SENTRY_RELEASE ?? `coach-watts-mobile@${APP_VERSION}`,
    dist: SENTRY_DIST,
  });
}
