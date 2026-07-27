import * as Sentry from '@sentry/react-native';

export type PaywallAnalyticsEvent =
  | 'paywall_viewed'
  | 'paywall_quota_blocked'
  | 'paywall_quota_cta_tapped'
  | 'purchase_started'
  | 'purchase_completed'
  | 'purchase_cancelled'
  | 'purchase_failed'
  | 'restore_started'
  | 'restore_completed';

/**
 * Funnel breadcrumbs so paywall impressions can be attributed to the limit that
 * triggered them. Never attach prices, user ids or health values.
 */
export function trackPaywallEvent(
  event: PaywallAnalyticsEvent,
  extras?: Record<string, string | number | boolean | null | undefined>,
): void {
  const safe: Record<string, string | number | boolean> = {};
  if (extras) {
    for (const [key, value] of Object.entries(extras)) {
      if (value === undefined || value === null) continue;
      safe[key] = value;
    }
  }

  Sentry.addBreadcrumb({
    category: 'subscription',
    message: event,
    level: 'info',
    data: safe,
  });

  if (__DEV__) {
    console.info('[subscription]', event, safe);
  }
}
