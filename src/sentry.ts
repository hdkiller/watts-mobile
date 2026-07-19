import { SENTRY_DSN } from '@/src/config/env';

export function initSentry() {
  if (!SENTRY_DSN) return;

  // Lazy require so builds without a DSN stay lightweight.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Sentry = require('@sentry/react-native') as typeof import('@sentry/react-native');
  Sentry.init({
    dsn: SENTRY_DSN,
    tracesSampleRate: 0.1,
    enableAutoSessionTracking: true,
  });
}
