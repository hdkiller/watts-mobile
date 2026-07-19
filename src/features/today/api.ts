import { apiFetch } from '@/src/api/client';

import { mapTodayPayload } from './mapTodayPayload';
import type { ActivityRecommendationApi, TodayViewModel } from './types';

export async function fetchTodayView(): Promise<TodayViewModel> {
  const response = await apiFetch('/api/recommendations/today');
  // Local IdP returns 204 when there is no recommendation for today.
  if (response.status === 204 || response.status === 404) {
    return mapTodayPayload(null);
  }
  if (!response.ok) {
    throw new Error(`Failed to load today (${response.status})`);
  }

  const text = await response.text();
  if (!text || text === 'null') {
    return mapTodayPayload(null);
  }

  const json = JSON.parse(text) as ActivityRecommendationApi | null;
  return mapTodayPayload(json);
}

export async function acceptRecommendation(id: string): Promise<void> {
  const response = await apiFetch(`/api/recommendations/${id}/accept`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });

  if (!response.ok) {
    let message = `Accept failed (${response.status})`;
    try {
      const body = (await response.json()) as { message?: string; statusMessage?: string };
      message = body.message || body.statusMessage || message;
    } catch {
      // ignore
    }
    throw new Error(message);
  }
}

/** Re-export — planned detail owned by activity glance module. */
export { fetchPlannedWorkout } from '@/src/features/activity/api';
