import { apiFetch } from '@/src/api/client';

import { mapPlannedDetail, mapPlannedListItem, mapWorkoutListItem, mapWorkoutSummary } from './mapActivity';
import type {
  ActivityListItem,
  ActivitySummary,
  PlannedDetail,
  PlannedDetailApi,
  PlannedListItem,
  PlannedListItemApi,
  WorkoutListItemApi,
} from './types';
import { RECENT_ACTIVITY_LIMIT, UPCOMING_PLANNED_LIMIT, UPCOMING_WINDOW_DAYS } from './types';

async function readErrorMessage(response: Response, fallback: string): Promise<string> {
  try {
    const body = (await response.json()) as { message?: string; statusMessage?: string };
    return body.message || body.statusMessage || fallback;
  } catch {
    return fallback;
  }
}

function toIsoDate(d: Date): string {
  return d.toISOString();
}

export async function fetchRecentActivities(
  limit: number = RECENT_ACTIVITY_LIMIT
): Promise<ActivityListItem[]> {
  const capped = Math.min(Math.max(limit, 1), RECENT_ACTIVITY_LIMIT);
  const response = await apiFetch(`/api/workouts?limit=${capped}&offset=0`);
  if (!response.ok) {
    throw new Error(await readErrorMessage(response, `Failed to load workouts (${response.status})`));
  }
  const json = (await response.json()) as WorkoutListItemApi[];
  if (!Array.isArray(json)) return [];
  return json.map(mapWorkoutListItem);
}

export async function fetchUpcomingPlanned(
  options: {
    limit?: number;
    windowDays?: number;
  } = {}
): Promise<PlannedListItem[]> {
  const limit = Math.min(
    Math.max(options.limit ?? UPCOMING_PLANNED_LIMIT, 1),
    UPCOMING_PLANNED_LIMIT
  );
  const windowDays = options.windowDays ?? UPCOMING_WINDOW_DAYS;

  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + windowDays);
  end.setHours(23, 59, 59, 999);

  const params = new URLSearchParams({
    limit: String(limit),
    startDate: toIsoDate(start),
    endDate: toIsoDate(end),
  });

  const response = await apiFetch(`/api/planned-workouts?${params.toString()}`);
  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, `Failed to load planned workouts (${response.status})`)
    );
  }
  const json = (await response.json()) as PlannedListItemApi[];
  if (!Array.isArray(json)) return [];
  return json.map(mapPlannedListItem);
}

export async function fetchActivitySummary(id: string): Promise<ActivitySummary> {
  const response = await apiFetch(`/api/workouts/${encodeURIComponent(id)}?includeStreams=false`);
  if (!response.ok) {
    throw new Error(await readErrorMessage(response, `Failed to load workout (${response.status})`));
  }
  const json = (await response.json()) as WorkoutListItemApi & { description?: string | null };
  return mapWorkoutSummary(json);
}

export async function fetchPlannedWorkoutDetail(id: string): Promise<PlannedDetail> {
  const response = await apiFetch(`/api/planned-workouts/${encodeURIComponent(id)}`);
  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, `Failed to load planned workout (${response.status})`)
    );
  }
  const json = (await response.json()) as PlannedDetailApi;
  return mapPlannedDetail(json);
}

/** @deprecated Prefer fetchPlannedWorkoutDetail — kept for Today callers that need raw JSON. */
export async function fetchPlannedWorkout(id: string): Promise<Record<string, unknown>> {
  const response = await apiFetch(`/api/planned-workouts/${encodeURIComponent(id)}`);
  if (!response.ok) {
    throw new Error(`Failed to load planned workout (${response.status})`);
  }
  return (await response.json()) as Record<string, unknown>;
}
