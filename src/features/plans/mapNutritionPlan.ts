import { localDateKey } from '@/src/features/today/weekGlance';

import type {
  GroceryItemView,
  NutritionPlanApi,
  NutritionPlanDayView,
  NutritionPlanMealApi,
  NutritionPlanMealView,
} from './types';

/** True when the plan meal has a catalog/selection payload (not just an empty fueling window). */
export function mealHasSelection(meal: NutritionPlanMealApi): boolean {
  const json = meal.mealJson;
  if (!json || typeof json !== 'object') return false;
  const o = json as Record<string, unknown>;
  if (typeof o.title === 'string' && o.title.trim()) return true;
  if (typeof o.name === 'string' && o.name.trim()) return true;
  if (Array.isArray(o.ingredients) && o.ingredients.length > 0) return true;
  return false;
}

function mealTitle(meal: NutritionPlanMealApi): string {
  const json = meal.mealJson;
  if (json && typeof json === 'object') {
    const o = json as Record<string, unknown>;
    if (typeof o.title === 'string' && o.title.trim()) return o.title.trim();
    if (typeof o.name === 'string' && o.name.trim()) return o.name.trim();
  }
  return meal.windowType ? String(meal.windowType).replace(/_/g, ' ') : 'Meal';
}

export function mapNutritionMeal(meal: NutritionPlanMealApi): NutritionPlanMealView | null {
  if (!meal?.id) return null;
  if (!mealHasSelection(meal)) return null;
  const dateKey = localDateKey(meal.date ?? meal.scheduledAt);
  if (!dateKey) return null;
  let scheduledLabel: string | null = null;
  if (meal.scheduledAt) {
    const d = new Date(meal.scheduledAt);
    if (!Number.isNaN(d.getTime())) {
      scheduledLabel = d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
    }
  }
  return {
    id: meal.id,
    dateKey,
    windowType: meal.windowType ? String(meal.windowType) : 'MEAL',
    status: meal.status ? String(meal.status) : 'PLANNED',
    title: mealTitle(meal),
    scheduledLabel,
  };
}

function weekdayLabelForKey(dateKey: string): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function dateKeysInRange(start: string, end: string): string[] {
  const keys: string[] = [];
  const cursor = new Date(`${start}T12:00:00`);
  const endDate = new Date(`${end}T12:00:00`);
  while (cursor <= endDate && keys.length < 14) {
    const y = cursor.getFullYear();
    const m = String(cursor.getMonth() + 1).padStart(2, '0');
    const d = String(cursor.getDate()).padStart(2, '0');
    keys.push(`${y}-${m}-${d}`);
    cursor.setDate(cursor.getDate() + 1);
  }
  return keys;
}

function toDayView(dateKey: string, dayMeals: NutritionPlanMealView[]): NutritionPlanDayView {
  return {
    dateKey,
    weekdayLabel: weekdayLabelForKey(dateKey),
    meals: dayMeals,
    plannedCount: dayMeals.filter((x) => x.status === 'PLANNED').length,
    doneCount: dayMeals.filter((x) => x.status === 'DONE').length,
    skippedCount: dayMeals.filter((x) => x.status === 'SKIPPED').length,
  };
}

/**
 * Group selected meals by day. When `range` is provided, always emit every day in the
 * week (web parity) so empty fueling shows as “No meals selected” instead of hiding days.
 */
export function mapNutritionPlanDays(
  plan: NutritionPlanApi | null | undefined,
  range?: { start: string; end: string }
): NutritionPlanDayView[] {
  const meals = (plan?.meals ?? [])
    .map(mapNutritionMeal)
    .filter((m): m is NutritionPlanMealView => Boolean(m));

  const byDay = new Map<string, NutritionPlanMealView[]>();
  for (const meal of meals) {
    const list = byDay.get(meal.dateKey) ?? [];
    list.push(meal);
    byDay.set(meal.dateKey, list);
  }

  if (range?.start && range?.end) {
    return dateKeysInRange(range.start, range.end).map((dateKey) =>
      toDayView(dateKey, byDay.get(dateKey) ?? [])
    );
  }

  return [...byDay.keys()].sort().map((dateKey) => toDayView(dateKey, byDay.get(dateKey) ?? []));
}

export function weekHasSelectedMeals(days: NutritionPlanDayView[]): boolean {
  return days.some((day) => day.meals.length > 0);
}

export function mapGroceryItems(json: unknown): GroceryItemView[] {
  if (!json || typeof json !== 'object') return [];
  const items = (json as { items?: unknown }).items;
  if (!Array.isArray(items)) return [];
  return items
    .map((row): GroceryItemView | null => {
      if (!row || typeof row !== 'object') return null;
      const r = row as Record<string, unknown>;
      const ingredient = typeof r.ingredient === 'string' ? r.ingredient : null;
      if (!ingredient) return null;
      const sources = Array.isArray(r.sourceMeals)
        ? r.sourceMeals
            .map((s) => {
              if (!s || typeof s !== 'object') return null;
              const o = s as { date?: string; title?: string };
              return [o.date?.slice?.(0, 10), o.title].filter(Boolean).join(' · ') || null;
            })
            .filter((x): x is string => Boolean(x))
        : [];
      return {
        ingredient,
        quantity: typeof r.quantity === 'number' ? r.quantity : null,
        unit: typeof r.unit === 'string' ? r.unit : null,
        category: typeof r.category === 'string' ? r.category : null,
        sourceLabels: sources,
      };
    })
    .filter((x): x is GroceryItemView => Boolean(x));
}

export function weekRangeFromOffset(weekOffset: number): { start: string; end: string } {
  const now = new Date();
  const day = now.getDay(); // 0 Sun
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + mondayOffset + weekOffset * 7
  );
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const fmt = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dayNum = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${dayNum}`;
  };
  return { start: fmt(monday), end: fmt(sunday) };
}
