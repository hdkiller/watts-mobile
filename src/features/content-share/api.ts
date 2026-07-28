import { apiFetch } from '@/src/api/client';
import type { GenerateSharePayload, GenerateShareResponse } from './types';

/**
 * Mint a public share token/URL for a workout or planned workout.
 */
export async function generateShareToken(
  payload: GenerateSharePayload,
): Promise<GenerateShareResponse> {
  const response = await apiFetch('/api/share/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to generate share token: ${response.status} ${errText}`);
  }

  const data = (await response.json()) as GenerateShareResponse;
  return data;
}
