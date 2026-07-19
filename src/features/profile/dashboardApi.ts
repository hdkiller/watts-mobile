import { apiFetch } from '@/src/api/client';

export type DashboardProfile = {
  restingHr: number | null;
  recentHRV: number | null;
  recentSleep: number | null;
  latestWellnessDate: string | null;
  hasCurrentDayWellness: boolean;
};

export type WellnessTrendDay = {
  date: string;
  hrv: number | null;
  restingHr: number | null;
  hoursSlept: number | null;
  sleepScore: number | null;
  recoveryScore: number | null;
  readiness: number | null;
};

export async function fetchDashboardProfile(): Promise<DashboardProfile> {
  const response = await apiFetch('/api/profile/dashboard');
  if (!response.ok) {
    throw new Error(`Failed to load dashboard profile (${response.status})`);
  }
  const json = await response.json();
  // The API response returned a structure where the keys are directly in the response body.
  const data = json.profile || json;
  return {
    restingHr: typeof data.restingHr === 'number' ? data.restingHr : null,
    recentHRV: typeof data.recentHRV === 'number' ? data.recentHRV : null,
    recentSleep: typeof data.recentSleep === 'number' ? data.recentSleep : null,
    latestWellnessDate: data.latestWellnessDate ?? null,
    hasCurrentDayWellness: Boolean(data.hasCurrentDayWellness),
  };
}

export async function fetchWellnessTrend(
  startDate: string,
  endDate: string
): Promise<WellnessTrendDay[]> {
  const params = new URLSearchParams({ startDate, endDate });
  const response = await apiFetch(`/api/wellness/trend?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Failed to load wellness trend (${response.status})`);
  }
  return (await response.json()) as WellnessTrendDay[];
}
