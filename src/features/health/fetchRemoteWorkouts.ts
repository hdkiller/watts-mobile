import { apiFetch } from '@/src/api/client';

import type { RemoteWorkoutMatchCandidate } from './types';
import { LOOKBACK_DAYS } from './types';
import { lookbackStartDate } from './mapToWellnessPayload';

export async function fetchRemoteWorkoutsForMatch(
  lookbackDays: number = LOOKBACK_DAYS
): Promise<RemoteWorkoutMatchCandidate[]> {
  const start = lookbackStartDate(lookbackDays);
  const end = new Date();
  type WorkoutRow = {
    id?: string;
    externalId?: string | null;
    source?: string | null;
    date?: string | Date | null;
    type?: string | null;
    durationSec?: number | null;
  };
  const pageSize = 100;
  const rows: WorkoutRow[] = [];
  for (let page = 0; page < 20; page++) {
    const params = new URLSearchParams({
      limit: String(pageSize),
      offset: String(page * pageSize),
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    });
    const response = await apiFetch(`/api/workouts?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`Failed to load workouts for match (${response.status})`);
    }
    const pageRows = (await response.json()) as WorkoutRow[];
    if (!Array.isArray(pageRows)) break;
    rows.push(...pageRows);
    if (pageRows.length < pageSize) break;
  }

  return rows
    .filter((row): row is typeof row & { id: string } => typeof row.id === 'string')
    .map((row) => ({
      id: row.id,
      externalId: row.externalId ?? null,
      source: row.source ?? null,
      date: row.date != null ? String(row.date) : null,
      type: row.type ?? null,
      durationSec: row.durationSec ?? null,
    }));
}
