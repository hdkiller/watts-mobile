import { apiFetch } from '@/src/api/client';

import { filterActiveToday, parseRecoveryContextList } from './mapRecovery';
import type { JourneyEventPayload, RecoveryContextItem } from './types';

async function readErrorMessage(response: Response, fallback: string): Promise<string> {
  try {
    const body = (await response.json()) as { message?: string; statusMessage?: string };
    return body.message || body.statusMessage || fallback;
  } catch {
    return fallback;
  }
}

export async function fetchRecoveryContext(days = 7): Promise<RecoveryContextItem[]> {
  const response = await apiFetch(`/api/recovery-context?days=${days}`);
  if (!response.ok) {
    throw new Error(await readErrorMessage(response, `Failed to load recovery context (${response.status})`));
  }
  const json = await response.json();
  return parseRecoveryContextList(json);
}

export async function fetchActiveRecoveryToday(days = 7): Promise<RecoveryContextItem[]> {
  return filterActiveToday(await fetchRecoveryContext(days));
}

export async function createJourneyEvent(payload: JourneyEventPayload): Promise<void> {
  const response = await apiFetch('/api/recovery-context/journey', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(await readErrorMessage(response, `Failed to log event (${response.status})`));
  }
}

export async function updateJourneyEvent(id: string, payload: JourneyEventPayload): Promise<void> {
  const body = {
    ...payload,
    description: payload.description ?? null,
  };
  const response = await apiFetch(`/api/recovery-context/journey/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(await readErrorMessage(response, `Failed to update event (${response.status})`));
  }
}

export async function deleteJourneyEvent(id: string): Promise<void> {
  const response = await apiFetch(`/api/recovery-context/journey/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error(await readErrorMessage(response, `Failed to delete event (${response.status})`));
  }
}
