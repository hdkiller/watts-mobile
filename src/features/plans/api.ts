import { apiFetch } from '@/src/api/client';
import { ApiError } from '@/src/api/errors';

import type { PlanInitializeInput, PlanInitializeResult, PlannedWorkoutPreview } from './types';

async function readErrorBody(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return undefined;
  }
}

function errorMessage(body: unknown, fallback: string): string {
  if (typeof body === 'object' && body !== null && ('message' in body || 'statusMessage' in body)) {
    return String(
      (body as { message?: string; statusMessage?: string }).message ||
        (body as { statusMessage?: string }).statusMessage ||
        fallback
    );
  }
  return fallback;
}

export type AvailabilityDay = {
  dayOfWeek: number;
  morning?: boolean;
  afternoon?: boolean;
  evening?: boolean;
};

export async function saveAvailability(days: AvailabilityDay[]): Promise<void> {
  const response = await apiFetch('/api/availability', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ availability: days }),
  });
  if (!response.ok) {
    const body = await readErrorBody(response);
    throw new ApiError(
      errorMessage(body, `Failed to save availability (${response.status})`),
      response.status,
      body
    );
  }
}

export async function initializePlan(input: PlanInitializeInput): Promise<PlanInitializeResult> {
  const response = await apiFetch('/api/plans/initialize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const body = await readErrorBody(response);
    throw new ApiError(
      errorMessage(body, `Failed to initialize plan (${response.status})`),
      response.status,
      body
    );
  }
  return (await response.json()) as PlanInitializeResult;
}

async function fetchPlan(planId: string): Promise<PlanInitializeResult> {
  const response = await apiFetch(`/api/plans/${encodeURIComponent(planId)}`);
  if (!response.ok) {
    const body = await readErrorBody(response);
    throw new ApiError(
      errorMessage(body, `Failed to refresh plan preview (${response.status})`),
      response.status,
      body
    );
  }
  const plan = (await response.json()) as NonNullable<PlanInitializeResult['plan']>;
  return { planId, plan };
}

async function requestWeekPreview(blockId: string, weekId: string): Promise<void> {
  const response = await apiFetch('/api/plans/generate-ai-week', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ blockId, weekId }),
  });
  if (!response.ok) {
    const body = await readErrorBody(response);
    throw new ApiError(
      errorMessage(body, `Failed to generate plan preview (${response.status})`),
      response.status,
      body
    );
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Generate the draft's first real training week and poll until its workouts are persisted. */
export async function generateFirstWeekPreview(
  initialized: PlanInitializeResult,
  options: { timeoutMs?: number; pollMs?: number } = {}
): Promise<PlannedWorkoutPreview[]> {
  const existing = extractFirstWeekPreview(initialized);
  if (existing.length > 0) return existing;

  const blockId = initialized.plan?.blocks?.[0]?.id;
  const weekId = initialized.plan?.blocks?.[0]?.weeks?.[0]?.id;
  if (!blockId || !weekId) {
    throw new ApiError('The draft plan did not include a previewable first week', 422);
  }

  await requestWeekPreview(blockId, weekId);

  const timeoutMs = options.timeoutMs ?? 180_000;
  const pollMs = options.pollMs ?? 2_000;
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    await delay(pollMs);
    const refreshed = await fetchPlan(initialized.planId);
    const preview = extractFirstWeekPreview(refreshed);
    if (preview.length > 0) return preview;
  }

  throw new ApiError('Plan preview is still generating — try again shortly', 408);
}

export async function activatePlan(planId: string, startDate?: string): Promise<void> {
  const response = await apiFetch(`/api/plans/${encodeURIComponent(planId)}/activate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(startDate ? { startDate } : {}),
  });
  if (!response.ok) {
    const body = await readErrorBody(response);
    throw new ApiError(
      errorMessage(body, `Failed to activate plan (${response.status})`),
      response.status,
      body
    );
  }
}

export async function fetchUpcomingPlanned(limit = 7): Promise<PlannedWorkoutPreview[]> {
  const response = await apiFetch(`/api/planned-workouts?limit=${limit}`);
  if (!response.ok) return [];
  const json = await response.json();
  if (Array.isArray(json)) return json as PlannedWorkoutPreview[];
  if (json && typeof json === 'object' && Array.isArray((json as { workouts?: unknown }).workouts)) {
    return (json as { workouts: PlannedWorkoutPreview[] }).workouts;
  }
  if (json && typeof json === 'object' && Array.isArray((json as { items?: unknown }).items)) {
    return (json as { items: PlannedWorkoutPreview[] }).items;
  }
  return [];
}

export function extractFirstWeekPreview(result: PlanInitializeResult): PlannedWorkoutPreview[] {
  const weeks = result.plan?.blocks?.[0]?.weeks ?? [];
  const first = weeks[0];
  if (!first?.workouts?.length) return [];
  return first.workouts.map((w) => ({
    id: w.id,
    title: w.title,
    type: w.type,
    date: w.date,
    duration: w.duration ?? (w.durationSec ? Math.round(w.durationSec / 60) : null),
  }));
}
