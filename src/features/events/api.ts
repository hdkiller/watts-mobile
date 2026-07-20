import { apiFetch } from '@/src/api/client';

import type { EventApi } from './types';

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
