import { apiFetch } from '@/src/api/client';

import { buildSportSettingsUpsertPayload, parseSportProfilesFromProfileResponse } from './mapSports';
import type { SportProfile, SportThresholdPatch } from './types';

async function readErrorMessage(response: Response, fallback: string): Promise<string> {
  try {
    const body = (await response.json()) as { message?: string; statusMessage?: string };
    return body.message || body.statusMessage || fallback;
  } catch {
    return fallback;
  }
}

export async function fetchSportProfiles(): Promise<SportProfile[]> {
  const response = await apiFetch('/api/profile');
  if (!response.ok) {
    throw new Error(await readErrorMessage(response, `Failed to load sport profiles (${response.status})`));
  }
  const json = await response.json();
  return parseSportProfilesFromProfileResponse(json);
}

export async function patchSportProfileThresholds(
  profile: SportProfile,
  patch: SportThresholdPatch
): Promise<SportProfile[]> {
  const sportSettings = buildSportSettingsUpsertPayload(profile, patch);
  const response = await apiFetch('/api/profile', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sportSettings }),
  });
  if (!response.ok) {
    throw new Error(await readErrorMessage(response, `Failed to save sport profile (${response.status})`));
  }
  const json = await response.json();
  // Prefer returned sportSettings; otherwise re-fetch semantics via parse of PATCH body.
  const fromPatch = parseSportProfilesFromProfileResponse(json);
  if (fromPatch.length > 0) return fromPatch;
  return fetchSportProfiles();
}
