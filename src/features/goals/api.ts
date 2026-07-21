import { apiFetch } from '@/src/api/client';
import { ApiError } from '@/src/api/errors';

import type { CreateGoalInput, GoalApi } from './types';

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

export async function fetchGoals(): Promise<GoalApi[]> {
  const response = await apiFetch('/api/goals');
  if (!response.ok) {
    const body = await readErrorBody(response);
    throw new ApiError(errorMessage(body, `Failed to load goals (${response.status})`), response.status, body);
  }
  const json = await response.json();
  if (Array.isArray(json)) return json as GoalApi[];
  if (json && typeof json === 'object' && Array.isArray((json as { goals?: unknown }).goals)) {
    return (json as { goals: GoalApi[] }).goals;
  }
  return [];
}

export async function createGoal(input: CreateGoalInput): Promise<GoalApi> {
  const response = await apiFetch('/api/goals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const body = await readErrorBody(response);
    throw new ApiError(errorMessage(body, `Failed to create goal (${response.status})`), response.status, body);
  }
  const json = (await response.json()) as { goal?: GoalApi } & GoalApi;
  return json.goal ?? (json as GoalApi);
}

export async function patchGoal(
  id: string,
  patch: Partial<Pick<CreateGoalInput, 'title' | 'targetDate' | 'metric' | 'targetValue'>>
): Promise<GoalApi> {
  const response = await apiFetch(`/api/goals/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
  if (!response.ok) {
    const body = await readErrorBody(response);
    throw new ApiError(errorMessage(body, `Failed to update goal (${response.status})`), response.status, body);
  }
  const json = (await response.json()) as { goal?: GoalApi } & GoalApi;
  return json.goal ?? (json as GoalApi);
}
