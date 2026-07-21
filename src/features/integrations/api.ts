import { apiFetch } from '@/src/api/client';
import { ApiError } from '@/src/api/errors';

import type { IntegrationsStatusResponse } from './types';

async function readErrorBody(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return undefined;
  }
}

export async function fetchIntegrationStatus(): Promise<IntegrationsStatusResponse> {
  // softUnauthorized: older instances still use session-only auth on this route.
  // A 401 here must not clear the companion Bearer session (kicks user to login).
  const response = await apiFetch('/api/integrations/status', { softUnauthorized: true });
  if (!response.ok) {
    const body = await readErrorBody(response);
    const message =
      typeof body === 'object' &&
      body !== null &&
      ('message' in body || 'statusMessage' in body)
        ? String(
            (body as { message?: string; statusMessage?: string }).message ||
              (body as { statusMessage?: string }).statusMessage ||
              `Failed to load integrations (${response.status})`
          )
        : `Failed to load integrations (${response.status})`;
    throw new ApiError(message, response.status, body);
  }
  return (await response.json()) as IntegrationsStatusResponse;
}
