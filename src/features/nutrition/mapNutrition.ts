import type {
  MealSlot,
  NutritionDayTotals,
  NutritionItemPayload,
  NutritionQuickLogForm,
  NutritionUploadPayload,
} from './types';

export function localDateYmd(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function emptyNutritionDay(date = localDateYmd()): NutritionDayTotals {
  return {
    id: null,
    date,
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    waterMl: 0,
    isEmpty: true,
  };
}

function asNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

/** Pick today’s row from GET /api/nutrition response. */
export function pickTodayNutrition(payload: unknown, today = localDateYmd()): NutritionDayTotals {
  const empty = emptyNutritionDay(today);
  if (!payload || typeof payload !== 'object') return empty;

  const root = payload as Record<string, unknown>;
  const rows = Array.isArray(root.nutrition)
    ? root.nutrition
    : Array.isArray(payload)
      ? payload
      : null;
  if (!rows) return empty;

  for (const row of rows) {
    if (!row || typeof row !== 'object') continue;
    const r = row as Record<string, unknown>;
    const date = r.date != null ? String(r.date).slice(0, 10) : '';
    if (date !== today) continue;

    const calories = Math.round(asNumber(r.calories));
    const protein = asNumber(r.protein);
    const carbs = asNumber(r.carbs);
    const fat = asNumber(r.fat);
    const waterMl = Math.round(asNumber(r.waterMl));
    const isEmpty = calories === 0 && protein === 0 && carbs === 0 && fat === 0 && waterMl === 0;

    return {
      id: r.id != null ? String(r.id) : null,
      date,
      calories,
      protein,
      carbs,
      fat,
      waterMl,
      isEmpty,
    };
  }

  return empty;
}

function parseOptionalNumber(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : undefined;
}

export function emptyQuickLogForm(meal: MealSlot = 'SNACK'): NutritionQuickLogForm {
  return {
    meal,
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
  };
}

export function quickLogHasContent(form: NutritionQuickLogForm): boolean {
  return Boolean(
    form.name.trim() ||
      form.calories.trim() ||
      form.protein.trim() ||
      form.carbs.trim() ||
      form.fat.trim()
  );
}

export function toNutritionUploadPayload(
  form: NutritionQuickLogForm,
  date = localDateYmd(),
  loggedAt = new Date()
): NutritionUploadPayload {
  const item: NutritionItemPayload = {
    meal: form.meal,
    logged_at: loggedAt.toISOString(),
  };

  const name = form.name.trim();
  if (name) item.name = name;

  const calories = parseOptionalNumber(form.calories);
  const protein = parseOptionalNumber(form.protein);
  const carbs = parseOptionalNumber(form.carbs);
  const fat = parseOptionalNumber(form.fat);

  if (calories != null) item.calories = Math.round(calories);
  if (protein != null) item.protein = protein;
  if (carbs != null) item.carbs = carbs;
  if (fat != null) item.fat = fat;

  return { date, items: [item] };
}

export function nutritionWebPath(): string {
  return '/nutrition';
}

export function formatMacroGrams(value: number): string {
  if (!Number.isFinite(value)) return '0';
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}
