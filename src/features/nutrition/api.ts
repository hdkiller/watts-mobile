import { apiFetch } from '@/src/api/client';

import { localDateYmd, pickNextFuelingWindow, pickTodayNutrition } from './mapNutrition';
import type {
  HydrationQuickAddPayload,
  NextFuelingWindow,
  NutritionDayTotals,
  NutritionUploadPayload,
} from './types';

async function readErrorMessage(response: Response, fallback: string): Promise<string> {
  try {
    const body = (await response.json()) as { message?: string; statusMessage?: string };
    return body.message || body.statusMessage || fallback;
  } catch {
    return fallback;
  }
}

export async function fetchTodayNutrition(date = localDateYmd()): Promise<NutritionDayTotals> {
  const params = new URLSearchParams({
    startDate: date,
    endDate: date,
    limit: '5',
  });
  const response = await apiFetch(`/api/nutrition?${params.toString()}`);
  if (!response.ok) {
    throw new Error(await readErrorMessage(response, `Failed to load nutrition (${response.status})`));
  }
  const json = await response.json();
  return pickTodayNutrition(json, date);
}

export async function fetchNextFuelingWindow(): Promise<NextFuelingWindow | null> {
  const response = await apiFetch('/api/nutrition/upcoming-plan');
  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, `Failed to load fueling plan (${response.status})`)
    );
  }
  const json = await response.json();
  return pickNextFuelingWindow(json);
}

export async function logNutritionItem(payload: NutritionUploadPayload): Promise<void> {
  const response = await apiFetch('/api/nutrition', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(await readErrorMessage(response, `Failed to log nutrition (${response.status})`));
  }
}

export async function quickAddHydration(payload: HydrationQuickAddPayload): Promise<number> {
  const response = await apiFetch('/api/nutrition/hydration-quick-add', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(await readErrorMessage(response, `Failed to add hydration (${response.status})`));
  }
  try {
    const body = (await response.json()) as { totalWaterMl?: number };
    return typeof body.totalWaterMl === 'number' ? body.totalWaterMl : payload.volumeMl;
  } catch {
    return payload.volumeMl;
  }
}
