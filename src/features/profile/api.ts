import { apiFetch } from '@/src/api/client';

import { parseAiSettingsLite, parseAthleteProfile } from './mapProfile';
import type {
  AiSettingsLite,
  AiSettingsLitePatch,
  AthleteMetricsPatch,
  AthleteProfile,
  CoachIdentityProfilePatch,
  UnitsLocalePatch,
} from './types';

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

export async function patchUnitsLocale(patch: UnitsLocalePatch): Promise<AthleteProfile> {
  const response = await apiFetch('/api/profile', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
  if (!response.ok) {
    throw new Error(await readErrorMessage(response, `Failed to save units (${response.status})`));
  }
  const json = await response.json();
  return parseAthleteProfile(json);
}

export async function patchCoachIdentityProfile(
  patch: CoachIdentityProfilePatch
): Promise<AthleteProfile> {
  const response = await apiFetch('/api/profile', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, `Failed to save coach identity (${response.status})`)
    );
  }
  const json = await response.json();
  return parseAthleteProfile(json);
}

export async function fetchAiSettingsLite(): Promise<AiSettingsLite> {
  const response = await apiFetch('/api/settings/ai');
  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, `Failed to load AI settings (${response.status})`)
    );
  }
  const json = await response.json();
  return parseAiSettingsLite(json);
}

export async function patchAiSettingsLite(patch: AiSettingsLitePatch): Promise<AiSettingsLite> {
  const response = await apiFetch('/api/settings/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, `Failed to save AI settings (${response.status})`)
    );
  }
  const json = (await response.json()) as { settings?: unknown };
  return parseAiSettingsLite(json.settings ?? json);
}

/** True when GET /api/settings/ai accepts Bearer (not cookie-only 401). */
export async function isAiSettingsBearerAvailable(): Promise<boolean> {
  try {
    const response = await apiFetch('/api/settings/ai');
    return response.ok;
  } catch {
    return false;
  }
}
