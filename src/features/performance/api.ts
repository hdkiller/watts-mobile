import { apiFetch } from '@/src/api/client';

import { mapPmcPayload } from './mapPmc';
import type { PmcPayload, PmcPeriodDays } from './types';

export async function fetchPmc(days: PmcPeriodDays): Promise<PmcPayload> {
  const response = await apiFetch(`/api/performance/pmc?days=${days}`);
  if (!response.ok) {
    const err = new Error(`Failed to load training load (${response.status})`) as Error & {
      status?: number;
    };
    err.status = response.status;
    throw err;
  }
  const json = await response.json();
  return mapPmcPayload(json);
}
