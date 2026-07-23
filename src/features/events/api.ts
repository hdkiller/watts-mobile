import { apiFetch } from '@/src/api/client';
import { ApiError } from '@/src/api/errors';

import type { CreateEventInput, EventApi } from './types';

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

export async function fetchEvents(): Promise<EventApi[]> {
  const res = await apiFetch('/api/events');
  if (!res.ok) {
    throw new Error(`Failed to load events (${res.status})`);
  }
  const body = (await res.json()) as unknown;
  if (!Array.isArray(body)) return [];
  return body as EventApi[];
}

export async function fetchEvent(id: string): Promise<EventApi> {
  const res = await apiFetch(`/api/events/${encodeURIComponent(id)}`);
  if (!res.ok) {
    throw new Error(`Failed to load event (${res.status})`);
  }
  return (await res.json()) as EventApi;
}

export async function createEvent(input: CreateEventInput): Promise<EventApi> {
  const response = await apiFetch('/api/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const body = await readErrorBody(response);
    throw new ApiError(errorMessage(body, `Failed to create event (${response.status})`), response.status, body);
  }
  const json = (await response.json()) as { event?: EventApi } & EventApi;
  return json.event ?? (json as EventApi);
}
