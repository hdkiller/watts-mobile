import { apiFetch } from '@/src/api/client';

import type { HealthWellnessUploadPayload } from './types';

export async function uploadWellnessPayload(payload: HealthWellnessUploadPayload): Promise<void> {
  const response = await apiFetch('/api/wellness', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let message = `Wellness sync failed (${response.status})`;
    try {
      const body = (await response.json()) as { message?: string; statusMessage?: string };
      message = body.message || body.statusMessage || message;
    } catch {
      // ignore
    }
    throw new Error(message);
  }
}
