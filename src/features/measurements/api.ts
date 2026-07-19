import { apiFetch } from '@/src/api/client';

import { parseBodyMeasurementsResponse } from './mapMeasurements';
import type { BodyMeasurementsSnapshot, CreateBodyMeasurementPayload } from './types';

async function readErrorMessage(response: Response, fallback: string): Promise<string> {
  try {
    const body = (await response.json()) as { message?: string; statusMessage?: string };
    return body.message || body.statusMessage || fallback;
  } catch {
    return fallback;
  }
}

export async function fetchBodyMeasurements(limit = 50): Promise<BodyMeasurementsSnapshot> {
  const params = new URLSearchParams({ limit: String(limit) });
  const response = await apiFetch(`/api/body-measurements?${params.toString()}`);
  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, `Failed to load measurements (${response.status})`)
    );
  }
  return parseBodyMeasurementsResponse(await response.json());
}

export async function createBodyMeasurement(
  payload: CreateBodyMeasurementPayload
): Promise<void> {
  const response = await apiFetch('/api/body-measurements', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, `Failed to save measurement (${response.status})`)
    );
  }
}

export async function softDeleteBodyMeasurement(id: string): Promise<void> {
  const response = await apiFetch(`/api/body-measurements/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ isDeleted: true }),
  });
  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, `Failed to delete measurement (${response.status})`)
    );
  }
}
