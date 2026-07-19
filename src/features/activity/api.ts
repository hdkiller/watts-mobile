import { apiFetch } from '@/src/api/client';

import type {
  ActivityStreamCharts,
  PowerCurveApi,
  PowerCurveCharts,
  WorkoutStreamsApi,
} from './chartTypes';
import {
  mapPlannedDetail,
  mapPlannedListItem,
  mapWorkoutListItem,
  mapWorkoutSummary,
  type DistanceDisplayUnits,
} from './mapActivity';
import { mapActivityStreamCharts, mapPowerCurveCharts } from './mapCharts';
import type {
  ActivityListItem,
  ActivitySummary,
  PlannedDetail,
  PlannedDetailApi,
  PlannedListItem,
  PlannedListItemApi,
  WorkoutListItemApi,
  WorkoutSummaryApi,
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
    /** Include this many local days before today (for plan-vs-done pairing). */
    lookbackDays?: number;
  } = {}
): Promise<PlannedListItem[]> {
  const limit = Math.min(
    Math.max(options.limit ?? UPCOMING_PLANNED_LIMIT, 1),
    UPCOMING_PLANNED_LIMIT
  );
  const windowDays = options.windowDays ?? UPCOMING_WINDOW_DAYS;
  const lookbackDays = Math.max(options.lookbackDays ?? 0, 0);

  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - lookbackDays);
  const end = new Date();
  end.setHours(0, 0, 0, 0);
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

export async function fetchActivitySummary(
  id: string,
  distanceUnits: DistanceDisplayUnits = 'Kilometers'
): Promise<ActivitySummary> {
  const response = await apiFetch(`/api/workouts/${encodeURIComponent(id)}?includeStreams=false`);
  if (!response.ok) {
    throw new Error(await readErrorMessage(response, `Failed to load workout (${response.status})`));
  }
  const json = (await response.json()) as WorkoutSummaryApi;
  return mapWorkoutSummary(json, distanceUnits);
}

export class AnalyzeWorkoutError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'AnalyzeWorkoutError';
    this.status = status;
  }
}

export async function fetchActivityStreamCharts(id: string): Promise<ActivityStreamCharts | null> {
  const response = await apiFetch(`/api/workouts/${encodeURIComponent(id)}/streams`);
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(await readErrorMessage(response, `Failed to load streams (${response.status})`));
  }
  const json = (await response.json()) as WorkoutStreamsApi;
  return mapActivityStreamCharts(json);
}

export async function fetchActivityPowerCurve(id: string): Promise<PowerCurveCharts | null> {
  const response = await apiFetch(`/api/workouts/${encodeURIComponent(id)}/power-curve`);
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, `Failed to load power curve (${response.status})`)
    );
  }
  const json = (await response.json()) as PowerCurveApi;
  return mapPowerCurveCharts(json);
}

/** Start or regenerate AI analysis (async job). Requires Bearer `workout:write`. */
export async function requestWorkoutAnalysis(id: string): Promise<void> {
  const response = await apiFetch(`/api/workouts/${encodeURIComponent(id)}/analyze`, {
    method: 'POST',
  });
  if (!response.ok) {
    const message = await readErrorMessage(
      response,
      response.status === 403
        ? 'Analysis requires workout write permission. Sign out and sign in again.'
        : `Failed to start analysis (${response.status})`
    );
    throw new AnalyzeWorkoutError(message, response.status);
  }
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
