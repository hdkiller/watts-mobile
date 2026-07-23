import { apiFetch } from '@/src/api/client';

import { mapNutritionSettingsResponse } from './mapNutritionSettings';
import type { NutritionSettingsPayload, NutritionSettingsState } from './nutritionSettingsTypes';

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
    return fallback;
  } catch {
    return fallback;
  }
}

export async function fetchNutritionSettings(): Promise<NutritionSettingsState> {
  // Older self-hosted instances expose this route to cookie sessions only. A
  // Bearer 401 is therefore a capability miss, not proof that the mobile
  // session is invalid, and must not clear the athlete's stored tokens.
  const response = await apiFetch('/api/profile/nutrition', { softUnauthorized: true });
  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, `Failed to load nutrition settings (${response.status})`)
    );
  }
  const json = await response.json();
  return mapNutritionSettingsResponse(json);
}

export async function saveNutritionSettings(
  payload: NutritionSettingsPayload
): Promise<NutritionSettingsState> {
  const response = await apiFetch('/api/profile/nutrition', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    // See GET above. Keep an unsupported legacy endpoint local to this screen.
    softUnauthorized: true,
  });
  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, `Failed to save nutrition settings (${response.status})`)
    );
  }
  // POST body omits tracking flag / effective weight — re-fetch canonical GET shape.
  return fetchNutritionSettings();
}
