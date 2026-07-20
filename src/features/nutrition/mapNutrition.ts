import type {
  MealSlot,
  NextFuelingWindow,
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
    caloriesGoal: null,
    proteinGoal: null,
    carbsGoal: null,
    fatGoal: null,
    fluidGoalMl: null,
    hasGoals: false,
    fuelState: null,
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

function asGoal(value: unknown): number | null {
  const n = asNumber(value);
  return n > 0 ? n : null;
}

function planDailyTotals(plan: unknown): Record<string, unknown> | null {
  if (!plan || typeof plan !== 'object') return null;
  const totals = (plan as Record<string, unknown>).dailyTotals;
  if (!totals || typeof totals !== 'object') return null;
  return totals as Record<string, unknown>;
}

/** Daily fluid target lives inside the row's fuelingPlan JSON (dailyTotals.fluid, ml). */
function fluidGoalFromPlan(plan: unknown): number | null {
  return asGoal(planDailyTotals(plan)?.fluid);
}

function fuelStateFromPlan(plan: unknown): 1 | 2 | 3 | null {
  const n = asNumber(planDailyTotals(plan)?.fuelState);
  return n === 1 || n === 2 || n === 3 ? n : null;
}

export function fuelStateLabel(state: 1 | 2 | 3): string {
  return state === 3 ? 'Performance day' : state === 2 ? 'Steady day' : 'Eco day';
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

    const caloriesGoal = asGoal(r.caloriesGoal) != null ? Math.round(asGoal(r.caloriesGoal)!) : null;
    const proteinGoal = asGoal(r.proteinGoal);
    const carbsGoal = asGoal(r.carbsGoal);
    const fatGoal = asGoal(r.fatGoal);
    const fluidGoalMl =
      fluidGoalFromPlan(r.fuelingPlan) != null
        ? Math.round(fluidGoalFromPlan(r.fuelingPlan)!)
        : null;

    return {
      id: r.id != null ? String(r.id) : null,
      date,
      calories,
      protein,
      carbs,
      fat,
      waterMl,
      isEmpty,
      caloriesGoal,
      proteinGoal,
      carbsGoal,
      fatGoal,
      fluidGoalMl,
      hasGoals:
        caloriesGoal != null || proteinGoal != null || carbsGoal != null || fatGoal != null,
      fuelState: fuelStateFromPlan(r.fuelingPlan),
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

const WINDOW_TYPE_LABELS: Record<string, string> = {
  PRE_WORKOUT: 'Pre-workout',
  INTRA_WORKOUT: 'Intra-workout',
  POST_WORKOUT: 'Post-workout',
  WORKOUT_EVENT: 'Workout',
  TRANSITION: 'Transition',
  DAILY_BASE: 'Meal',
  general_day: 'Meal',
};

/** Pick the next upcoming window from GET /api/nutrition/upcoming-plan. */
export function pickNextFuelingWindow(payload: unknown, now = new Date()): NextFuelingWindow | null {
  if (!payload || typeof payload !== 'object') return null;
  const windows = (payload as Record<string, unknown>).windows;
  if (!Array.isArray(windows)) return null;

  let best: NextFuelingWindow | null = null;
  let bestStart = Infinity;
  for (const w of windows) {
    if (!w || typeof w !== 'object') continue;
    const r = w as Record<string, unknown>;
    const start = Date.parse(String(r.startTime ?? ''));
    const end = Date.parse(String(r.endTime ?? ''));
    if (!Number.isFinite(start) || !Number.isFinite(end)) continue;
    if (end <= now.getTime()) continue;
    if (start >= bestStart) continue;

    const slotName = typeof r.slotName === 'string' && r.slotName.trim() ? r.slotName.trim() : null;
    const type = String(r.type ?? '');
    bestStart = start;
    best = {
      label: slotName ?? WINDOW_TYPE_LABELS[type] ?? 'Fueling window',
      startTime: new Date(start).toISOString(),
      targetCarbs: Math.round(asNumber(r.targetCarbs)),
      targetProtein: Math.round(asNumber(r.targetProtein)),
      workoutTitle:
        typeof r.workoutTitle === 'string' && r.workoutTitle.trim() ? r.workoutTitle.trim() : null,
    };
  }
  return best;
}

export function formatWindowTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

/** Progress toward a goal as 0–100, clamped; null when there is no goal. */
export function goalProgressPct(value: number, goal: number | null): number | null {
  if (goal == null || goal <= 0 || !Number.isFinite(value)) return null;
  return Math.min(100, Math.max(0, Math.round((value / goal) * 100)));
}
