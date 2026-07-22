import { apiFetch } from '@/src/api/client';
import { ApiError } from '@/src/api/errors';

import type { SubscriptionSummary } from './types';

async function parse(response: Response): Promise<SubscriptionSummary> {
  if (!response.ok) {
    let body: unknown;
    try { body = await response.json(); } catch { body = undefined; }
    throw new ApiError(`Subscription request failed (${response.status})`, response.status, body);
  }
  return (await response.json()) as SubscriptionSummary;
}

export async function fetchSubscriptionSummary(): Promise<SubscriptionSummary> {
  return parse(await apiFetch('/api/subscriptions/me'));
}

export async function reconcileSubscription(): Promise<SubscriptionSummary> {
  return parse(await apiFetch('/api/subscriptions/reconcile', { method: 'POST' }));
}
