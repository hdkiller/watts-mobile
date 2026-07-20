import { apiFetch } from '@/src/api/client';
import { ApiError } from '@/src/api/errors';

import { mapTodayPayload } from './mapTodayPayload';
import type { ActivityRecommendationApi, TodayViewModel } from './types';

async function readApiError(response: Response, fallback: string): Promise<ApiError> {
  let message = fallback;
  let body: unknown;
  try {
    body = await response.json();
    const parsed = body as { message?: string; statusMessage?: string };
    message = parsed.message || parsed.statusMessage || message;
  } catch {
    // Non-JSON error bodies (proxy HTML, plain text) keep the status fallback.
  }
  return new ApiError(message, response.status, body);
}

export async function fetchTodayView(): Promise<TodayViewModel> {
  const response = await apiFetch('/api/recommendations/today');
  // Local IdP returns 204 when there is no recommendation for today.
  if (response.status === 204 || response.status === 404) {
    return mapTodayPayload(null);
  }
  if (!response.ok) {
    throw new ApiError(`Failed to load today (${response.status})`, response.status);
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
    throw await readApiError(response, `Accept failed (${response.status})`);
  }
}

export async function generateTodayRecommendation(userFeedback?: string): Promise<{
  success: boolean;
  jobId?: string;
  recommendationId?: string;
  message?: string;
}> {
  const response = await apiFetch('/api/recommendations/today', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userFeedback ? { userFeedback } : {}),
  });

  if (!response.ok) {
    const err = await readApiError(response, `Generation failed (${response.status})`);
    if (response.status === 429) {
      throw new ApiError(
        err.message || 'Quota exceeded for activity recommendation.',
        429,
        err.body
      );
    }
    throw err;
  }

  return response.json();
}

export async function fetchRecommendationStatus(jobId?: string): Promise<{
  isRunning: boolean;
  task: string | null;
}> {
  const path = jobId
    ? `/api/recommendations/status?jobId=${encodeURIComponent(jobId)}`
    : '/api/recommendations/status';
  const response = await apiFetch(path);
  if (!response.ok) {
    throw new ApiError(`Failed to load status (${response.status})`, response.status);
  }
  return response.json();
}

/** Re-export — planned detail owned by activity glance module. */
export { fetchPlannedWorkout } from '@/src/features/activity/api';
