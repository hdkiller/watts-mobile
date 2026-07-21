import * as Sentry from '@sentry/react-native';

export type ActivationAnalyticsEvent =
  | 'activation_consent_completed'
  | 'activation_goal_created'
  | 'activation_plan_activated'
  | 'activation_insight_viewed'
  | 'activation_connect_completed'
  | 'activation_connect_skipped'
  | 'activation_soft_activated'
  | 'activation_fully_activated';

/** Funnel breadcrumbs only — never attach health metric values. */
export function trackActivationEvent(
  event: ActivationAnalyticsEvent,
  extras?: Record<string, string | number | boolean | null | undefined>
): void {
  const safe: Record<string, string | number | boolean> = {};
  if (extras) {
    for (const [key, value] of Object.entries(extras)) {
      if (value === undefined || value === null) continue;
      // Block accidental metric-like keys
      if (/hrv|sleep|rhr|weight|calories|tss|power/i.test(key)) continue;
      safe[key] = value;
    }
  }

  Sentry.addBreadcrumb({
    category: 'activation',
    message: event,
    level: 'info',
    data: safe,
  });

  if (__DEV__) {
    console.info('[activation]', event, safe);
  }
}
