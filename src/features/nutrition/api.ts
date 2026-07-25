import { ApiError } from '@/src/api/errors';
import { apiFetch } from '@/src/api/client';

import { localDateYmd, pickNextFuelingWindow, pickTodayNutrition } from './mapNutrition';
import type {
  ApiMealType,
  HydrationQuickAddPayload,
  NextFuelingWindow,
  NutritionDayTotals,
  NutritionUploadPayload,
} from './types';
import type { MealRecommendationOption } from '@/src/features/plans/types';

export type NutritionItemPatchAction = 'add' | 'update' | 'delete';

export type NutritionItemPatchPayload = {
  action: NutritionItemPatchAction;
  mealType: ApiMealType;
  item?: {
    id?: string;
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    amount?: number;
    unit?: string;
    logged_at?: string;
  };
  itemId?: string;
};

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

/** Days per chunk — nutrition list has no offset; chunk the window so limit can't truncate. */
const NUTRITION_GLANCE_CHUNK_DAYS = 28;
/** Per-chunk row cap (API has no offset). One day-row is typical; leave headroom. */
const NUTRITION_GLANCE_CHUNK_LIMIT = 60;

function addDaysYmd(ymd: string, days: number): string {
  const [y, m, d] = ymd.split('-').map(Number);
  const dt = new Date(y, m - 1, d + days);
  const yy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  const dd = String(dt.getDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

function nutritionGlanceChunks(startYmd: string, endYmd: string): { start: string; end: string }[] {
  const chunks: { start: string; end: string }[] = [];
  let cursor = startYmd;
  while (cursor <= endYmd) {
    const chunkEnd = addDaysYmd(cursor, NUTRITION_GLANCE_CHUNK_DAYS - 1);
    chunks.push({ start: cursor, end: chunkEnd < endYmd ? chunkEnd : endYmd });
    cursor = addDaysYmd(chunkEnd, 1);
  }
  return chunks;
}

function loggedKeysFromNutritionPayload(
  json: unknown,
  startYmd: string,
  endYmd: string
): string[] {
  if (!json || typeof json !== 'object') return [];
  const rows = Array.isArray((json as { nutrition?: unknown }).nutrition)
    ? (json as { nutrition: unknown[] }).nutrition
    : Array.isArray(json)
      ? json
      : [];
  const keys: string[] = [];
  for (const row of rows) {
    if (!row || typeof row !== 'object') continue;
    const r = row as Record<string, unknown>;
    const date = r.date != null ? String(r.date).slice(0, 10) : '';
    if (!date || date < startYmd || date > endYmd) continue;
    const calories = typeof r.calories === 'number' ? r.calories : Number(r.calories) || 0;
    const protein = typeof r.protein === 'number' ? r.protein : Number(r.protein) || 0;
    const carbs = typeof r.carbs === 'number' ? r.carbs : Number(r.carbs) || 0;
    const fat = typeof r.fat === 'number' ? r.fat : Number(r.fat) || 0;
    const waterMl = typeof r.waterMl === 'number' ? r.waterMl : Number(r.waterMl) || 0;
    if (calories === 0 && protein === 0 && carbs === 0 && fat === 0 && waterMl === 0) continue;
    keys.push(date);
  }
  return keys;
}

/** Local date keys (YYYY-MM-DD) with any logged intake/hydration in range — Athlete glance. */
export async function fetchLoggedNutritionDateKeys(
  startYmd: string,
  endYmd: string
): Promise<string[]> {
  if (!startYmd || !endYmd || startYmd > endYmd) return [];
  const keys = new Set<string>();
  for (const chunk of nutritionGlanceChunks(startYmd, endYmd)) {
    const params = new URLSearchParams({
      startDate: chunk.start,
      endDate: chunk.end,
      limit: String(NUTRITION_GLANCE_CHUNK_LIMIT),
    });
    const response = await apiFetch(`/api/nutrition?${params.toString()}`);
    if (!response.ok) {
      throw new Error(
        await readErrorMessage(response, `Failed to load nutrition (${response.status})`)
      );
    }
    const json = await response.json();
    for (const date of loggedKeysFromNutritionPayload(json, chunk.start, chunk.end)) {
      keys.add(date);
    }
  }
  return [...keys];
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

/**
 * PATCH a single item on a nutrition day row (id or YYYY-MM-DD). Requires nutrition:write.
 * softUnauthorized: older coach-wattz builds still gate this route on cookie session only;
 * a Bearer 401 must not clear the mobile session (see apiFetch).
 */
export async function patchNutritionItems(
  nutritionId: string,
  payload: NutritionItemPatchPayload
): Promise<void> {
  const response = await apiFetch(`/api/nutrition/${encodeURIComponent(nutritionId)}/items`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    softUnauthorized: true,
  });
  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, `Failed to update nutrition item (${response.status})`)
    );
  }
}

/** PATCH day notes on a nutrition day row (id or YYYY-MM-DD). Requires nutrition:write. */
export async function patchNutritionNotes(
  nutritionId: string,
  notes: string | null
): Promise<void> {
  const response = await apiFetch(`/api/nutrition/${encodeURIComponent(nutritionId)}/notes`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ notes }),
  });
  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, `Failed to save nutrition notes (${response.status})`)
    );
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

export type DetectedFoodItem = {
  name: string;
  portion?: string;
  calories?: number;
};

export type PhotoEstimateContext = {
  selectedDate?: string;
  targetCalories?: number;
  targetProtein?: number;
  targetCarbs?: number;
  targetFat?: number;
  todayWorkoutSummary?: string;
};

export type PhotoNutritionEstimate = {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  meal?: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK' | 'OTHER';
  confidence?: 'HIGH' | 'MEDIUM' | 'LOW';
  coachInsight?: string;
  items?: DetectedFoodItem[];
};

export async function estimatePhotoNutrition(
  imageBase64: string,
  mimeType = 'image/jpeg',
  context?: PhotoEstimateContext
): Promise<PhotoNutritionEstimate> {
  const response = await apiFetch('/api/nutrition/estimate-photo', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64, mimeType, context }),
  });
  if (!response.ok) {
    throw new Error(await readErrorMessage(response, `Photo analysis failed (${response.status})`));
  }
  const json = (await response.json()) as {
    success?: boolean;
    estimate?: PhotoNutritionEstimate;
    message?: string;
    statusMessage?: string;
  };
  if (
    !json.success ||
    !json.estimate ||
    typeof json.estimate.name !== 'string' ||
    typeof json.estimate.calories !== 'number'
  ) {
    throw new Error(json.message || json.statusMessage || 'Photo analysis failed');
  }
  return json.estimate;
}

export async function fetchNutritionPlan(start: string, end: string): Promise<unknown> {
  const params = new URLSearchParams({ start, end });
  const response = await apiFetch(`/api/nutrition/plan?${params.toString()}`);
  if (!response.ok) {
    throw new Error(await readErrorMessage(response, `Failed to load nutrition plan (${response.status})`));
  }
  return response.json();
}

export async function generateNutritionPlanDraft(
  startDate: string,
  endDate: string
): Promise<unknown> {
  const response = await apiFetch('/api/nutrition/plan/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ startDate, endDate }),
  });
  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, `Failed to generate meal plan (${response.status})`)
    );
  }
  return response.json();
}

export async function regenerateDayFuelingPlan(date: string): Promise<unknown> {
  const response = await apiFetch('/api/nutrition/generate-plan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ date }),
  });
  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, `Failed to regenerate day plan (${response.status})`)
    );
  }
  return response.json();
}

export type NutritionMealAction = 'complete' | 'skip' | 'unlock' | 'replace';

export async function patchNutritionPlanMeal(
  mealId: string,
  action: NutritionMealAction,
  meal?: unknown
): Promise<unknown> {
  const response = await apiFetch(`/api/nutrition/plan/meals/${encodeURIComponent(mealId)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, ...(meal !== undefined ? { meal } : {}) }),
  });
  if (!response.ok) {
    throw new Error(await readErrorMessage(response, `Failed to update meal (${response.status})`));
  }
  return response.json();
}

export async function lockNutritionPlanMeal(input: {
  date: string;
  windowType: string;
  meal: unknown;
  slotName?: string;
}): Promise<unknown> {
  const response = await apiFetch('/api/nutrition/plan/meal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw new Error(await readErrorMessage(response, `Failed to lock meal (${response.status})`));
  }
  return response.json();
}

export type MealRecommendationTrigger = {
  date: string;
  windowType: string;
  targetCarbs?: number;
  targetProtein?: number;
  targetKcal?: number;
  forceLlm?: boolean;
};

function extractRecommendationOptions(raw: unknown, depth = 0): MealRecommendationOption[] | null {
  if (raw == null || depth > 6) return null;
  if (Array.isArray(raw)) {
    const options = raw.filter(
      (o) => o && typeof o === 'object' && typeof (o as { title?: unknown }).title === 'string'
    ) as MealRecommendationOption[];
    return options.length ? options : null;
  }
  if (typeof raw !== 'object') return null;
  const obj = raw as Record<string, unknown>;
  if (Array.isArray(obj.recommendations)) {
    return extractRecommendationOptions(obj.recommendations, depth + 1);
  }
  if (Array.isArray(obj.options)) {
    return extractRecommendationOptions(obj.options, depth + 1);
  }
  for (const key of ['output', 'result', 'data', 'payload', 'recommendation', 'resultJson']) {
    if (obj[key] != null) {
      const nested = extractRecommendationOptions(obj[key], depth + 1);
      if (nested) return nested;
    }
  }
  return null;
}

function isQuotaFailure(raw: unknown): boolean {
  if (!raw || typeof raw !== 'object') return false;
  const o = raw as Record<string, unknown>;
  if (o.reason === 'QUOTA_EXCEEDED') return true;
  const ctx = o.contextJson;
  if (ctx && typeof ctx === 'object' && (ctx as { error?: unknown }).error === 'QUOTA_EXCEEDED') {
    return true;
  }
  if (typeof o.message === 'string' && o.message.toLowerCase().includes('quota')) return true;
  return false;
}

async function triggerMealRecommendation(
  input: MealRecommendationTrigger
): Promise<{ runId?: string; recommendationId?: string }> {
  const response = await apiFetch('/api/nutrition/recommendations/meal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
    softUnauthorized: true,
  });
  if (!response.ok) {
    throw new ApiError(
      await readErrorMessage(response, `Failed to request meal recommendations (${response.status})`),
      response.status
    );
  }
  const json = (await response.json()) as {
    runId?: string;
    recommendationId?: string;
  };
  return json;
}

async function fetchMealRecommendationRecord(recommendationId: string): Promise<unknown> {
  const response = await apiFetch(
    `/api/nutrition/recommendations/${encodeURIComponent(recommendationId)}`,
    { softUnauthorized: true }
  );
  if (!response.ok) {
    throw new ApiError(
      await readErrorMessage(response, `Failed to load recommendation (${response.status})`),
      response.status
    );
  }
  return response.json();
}

const RECOMMENDATION_POLL_MS = 2000;
const RECOMMENDATION_TIMEOUT_MS = 90_000;

/**
 * Trigger AI/catalog meal options for a fueling window and poll until ready.
 * Quota exhaustion surfaces as ApiError status 429 with quota copy.
 */
export async function requestMealRecommendationOptions(
  input: MealRecommendationTrigger
): Promise<MealRecommendationOption[]> {
  const triggered = await triggerMealRecommendation(input);
  const recommendationId = triggered.recommendationId;
  if (!recommendationId) {
    throw new Error('Meal recommendation did not return an id');
  }

  const started = Date.now();
  while (Date.now() - started < RECOMMENDATION_TIMEOUT_MS) {
    const payload = await fetchMealRecommendationRecord(recommendationId);
    const root = payload && typeof payload === 'object' ? (payload as Record<string, unknown>) : {};
    const rec =
      root.recommendation && typeof root.recommendation === 'object'
        ? (root.recommendation as Record<string, unknown>)
        : root;
    const status = String(rec.status ?? '').toUpperCase();

    if (status === 'FAILED' || isQuotaFailure(rec) || isQuotaFailure(rec.contextJson)) {
      if (isQuotaFailure(rec) || isQuotaFailure(rec.contextJson) || isQuotaFailure(rec.resultJson)) {
        throw new ApiError(
          'Meal recommendation limit reached — try again later',
          429,
          rec
        );
      }
      throw new Error(
        typeof rec.message === 'string' && rec.message.trim()
          ? rec.message
          : 'Could not generate meal recommendations'
      );
    }

    if (status === 'COMPLETED' || status === 'READY') {
      const options =
        extractRecommendationOptions(rec.resultJson) ?? extractRecommendationOptions(rec);
      if (options?.length) return options;
      if (isQuotaFailure(rec.resultJson)) {
        throw new ApiError(
          'Meal recommendation limit reached — try again later',
          429,
          rec.resultJson
        );
      }
      throw new Error('No meal options returned for this window');
    }

    await new Promise((r) => setTimeout(r, RECOMMENDATION_POLL_MS));
  }

  throw new Error('Meal recommendations are taking too long — try again');
}

export async function fetchNutritionGrocery(start: string, end: string): Promise<unknown> {
  const params = new URLSearchParams({ start, end });
  const response = await apiFetch(`/api/nutrition/grocery?${params.toString()}`);
  if (!response.ok) {
    throw new Error(await readErrorMessage(response, `Failed to load grocery list (${response.status})`));
  }
  return response.json();
}

/** Metabolic strategy summary (fuel matrix + hydration standing). Bearer nutrition:read. */
export async function fetchNutritionStrategy(): Promise<unknown> {
  const response = await apiFetch('/api/nutrition/strategy');
  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, `Failed to load nutrition strategy (${response.status})`)
    );
  }
  return response.json();
}

/**
 * Multi-day energy wave. Default daysAhead matches web Strategy (`3`).
 * Bearer nutrition:read.
 */
export async function fetchNutritionExtendedWave(daysAhead = 3): Promise<unknown> {
  const params = new URLSearchParams({ daysAhead: String(daysAhead) });
  const response = await apiFetch(`/api/nutrition/extended-wave?${params.toString()}`);
  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, `Failed to load energy horizon (${response.status})`)
    );
  }
  return response.json();
}

/** Active fueling feed (suggestion + recent absorption). Bearer nutrition:read. */
export async function fetchNutritionActiveFeed(): Promise<unknown> {
  const response = await apiFetch('/api/nutrition/active-feed');
  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, `Failed to load active fueling feed (${response.status})`)
    );
  }
  return response.json();
}

/** Reset starting fluid deficit for today when the server prompts a flush. Bearer nutrition:write. */
export async function resetNutritionHydration(): Promise<unknown> {
  const response = await apiFetch('/api/nutrition/hydration-reset', { method: 'POST' });
  if (!response.ok) {
    throw new ApiError(
      await readErrorMessage(response, `Failed to reset hydration (${response.status})`),
      response.status
    );
  }
  return response.json();
}
