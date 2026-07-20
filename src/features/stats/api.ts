import { apiFetch } from '@/src/api/client';

import { mapMonthlyComparisonPayload } from './mapMonthlyComparison';
import type { MonthlyComparisonPayload } from './types';

export async function fetchMonthlyComparison(
  sport = 'all'
): Promise<MonthlyComparisonPayload> {
  const params = new URLSearchParams({ sport });
  const response = await apiFetch(`/api/stats/monthly-comparison?${params.toString()}`);
  if (!response.ok) {
    const err = new Error(`Failed to load monthly progress (${response.status})`) as Error & {
      status?: number;
    };
    err.status = response.status;
    throw err;
  }
  return mapMonthlyComparisonPayload(await response.json());
}

export async function fetchWorkoutSports(): Promise<string[]> {
  const response = await apiFetch('/api/workouts/sports');
  if (!response.ok) {
    throw new Error(`Failed to load sports (${response.status})`);
  }
  const json = await response.json();
  if (!Array.isArray(json)) return [];
  return json.filter((s): s is string => typeof s === 'string' && s.length > 0);
}
