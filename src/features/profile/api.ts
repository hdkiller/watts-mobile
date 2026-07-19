import { apiFetch } from '@/src/api/client';

import { parseAthleteProfile } from './mapProfile';
import type { AthleteMetricsPatch, AthleteProfile } from './types';

async function readErrorMessage(response: Response, fallback: string): Promise<string> {
  try {
    const body = (await response.json()) as {
      message?: string;
      statusMessage?: string;
      data?: unknown;
    };
    if (body.message || body.statusMessage) {
      return body.message || body.statusMessage || fallback;
    }
  } catch {
    // ignore parse errors
  }
  return fallback;
}

export async function fetchAthleteProfile(): Promise<AthleteProfile> {
  const response = await apiFetch('/api/profile');
  if (!response.ok) {
    throw new Error(await readErrorMessage(response, `Failed to load profile (${response.status})`));
  }
  const json = await response.json();
  return parseAthleteProfile(json);
}

export async function patchAthleteMetrics(patch: AthleteMetricsPatch): Promise<AthleteProfile> {
  const response = await apiFetch('/api/profile', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
  if (!response.ok) {
    throw new Error(await readErrorMessage(response, `Failed to save profile (${response.status})`));
  }
  const json = await response.json();
  // PATCH returns `{ success, profile }`; GET returns `{ connected, profile }`.
  return parseAthleteProfile(json);
}
