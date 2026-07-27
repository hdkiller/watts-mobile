/**
 * Row subtitle mappers for the More / Settings menus.
 *
 * Menu rows carry a status line so the list reads as live state rather than a
 * table of contents ("Pro · renews 12 Aug", "3 friends joined"). Pure functions
 * so the copy is unit-testable without mounting a screen.
 */
import type { SubscriptionSummary, SubscriptionTier } from '@/src/features/subscriptions/types';

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

/** Compact, locale-independent "12 Aug" used inside one-line row subtitles. */
export function shortDateLabel(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return `${date.getDate()} ${MONTHS[date.getMonth()]}`;
}

export function subscriptionTierLabel(tier: SubscriptionTier): string {
  switch (tier) {
    case 'PRO':
      return 'Pro';
    case 'SUPPORTER':
      return 'Supporter';
    default:
      return 'Free';
  }
}

const URGENT_STATUSES = ['PAST_DUE', 'BILLING_RETRY', 'GRACE_PERIOD'] as const;

/**
 * More / Settings → Subscription subtitle. Surfaces the tier plus the single
 * most useful fact: an action-required warning, the renewal date, or the end date.
 */
export function subscriptionRowDetail(
  summary: SubscriptionSummary | undefined,
  opts: { isLoading?: boolean; isError?: boolean } = {},
): string {
  if (!summary) {
    if (opts.isError) return 'Status unavailable';
    if (opts.isLoading) return 'Checking…';
    return 'Plan, billing & restore purchases';
  }

  const tier = subscriptionTierLabel(summary.tier);

  if (summary.hasCollision) return `${tier} · multiple active subscriptions`;
  if (summary.tier === 'FREE') return 'Free plan · see what Supporter unlocks';

  // The entitlement the athlete is actually paying for drives the date line.
  const active =
    summary.subscriptions.find((s) => s.tier === summary.tier && s.status === 'ACTIVE') ??
    summary.subscriptions.find((s) => s.tier === summary.tier) ??
    summary.subscriptions[0];

  if (!active) return tier;

  if (URGENT_STATUSES.includes(active.status as (typeof URGENT_STATUSES)[number])) {
    return `${tier} · action required`;
  }

  const end = shortDateLabel(active.entitlementEnd);
  if (!end) return tier;
  if (active.autoRenew === true) return `${tier} · renews ${end}`;
  if (active.autoRenew === false) return `${tier} · ends ${end}`;
  return `${tier} · through ${end}`;
}

/**
 * More → Invite a friend subtitle. Attribution count is social proof once it
 * exists; before that the copy promises the outcome, not the mechanism.
 */
export function inviteRowDetail(attributedCount: number | undefined): string {
  if (!attributedCount || attributedCount < 1) {
    return 'Share your code — they’ll be set up in minutes';
  }
  if (attributedCount === 1) return '1 friend joined so far';
  return `${attributedCount} friends joined so far`;
}

export function notificationsRowDetail(unreadCount: number): string {
  if (unreadCount <= 0) return 'All caught up';
  if (unreadCount === 1) return '1 unread';
  return `${unreadCount} unread`;
}
