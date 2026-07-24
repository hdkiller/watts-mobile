import type { ActivityListItem, PlannedListItem } from '@/src/features/activity/types';
import { localDateKey, weekRangeContaining } from '@/src/features/today/weekGlance';

/** Weeks including the current week that look backward from “now”. */
export const ACTIVITY_GLANCE_PAST_WEEKS = 10;
/** Extra Monday-start weeks after the current week. */
export const ACTIVITY_GLANCE_FUTURE_WEEKS = 2;
/** Total week columns = past (incl. current) + future. */
export const ACTIVITY_GLANCE_WEEK_COUNT =
  ACTIVITY_GLANCE_PAST_WEEKS + ACTIVITY_GLANCE_FUTURE_WEEKS;

export type ActivityGlanceDay = {
  dateKey: string;
  hasDone: boolean;
  hasPlanned: boolean;
  isToday: boolean;
  isFuture: boolean;
  activityIds: string[];
  plannedIds: string[];
};

export type ActivityGlanceWeek = {
  weekStartKey: string;
  days: ActivityGlanceDay[];
};

export type ActivityGlance = {
  weeks: ActivityGlanceWeek[];
  /** Local YYYY-MM-DD window bounds (inclusive). */
  startKey: string;
  endKey: string;
  doneDayCount: number;
  plannedDayCount: number;
  summaryLine: string;
};

function startOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function addLocalDays(d: Date, days: number): Date {
  const next = new Date(d);
  next.setDate(next.getDate() + days);
  return next;
}

/** Monday of (current week − (pastWeeks − 1)) through Sunday of (current week + futureWeeks). */
export function activityGlanceRange(now = new Date()): {
  start: Date;
  end: Date;
  startKey: string;
  endKey: string;
  weekStarts: Date[];
} {
  const { start: currentMonday } = weekRangeContaining(now);
  const start = addLocalDays(currentMonday, -(ACTIVITY_GLANCE_PAST_WEEKS - 1) * 7);
  const lastMonday = addLocalDays(currentMonday, ACTIVITY_GLANCE_FUTURE_WEEKS * 7);
  const end = addLocalDays(lastMonday, 6);
  const weekStarts: Date[] = [];
  for (let i = 0; i < ACTIVITY_GLANCE_WEEK_COUNT; i += 1) {
    weekStarts.push(addLocalDays(start, i * 7));
  }
  return {
    start,
    end,
    startKey: localDateKey(start)!,
    endKey: localDateKey(end)!,
    weekStarts,
  };
}

/**
 * Rolling 12-week done/planned day glance for Athlete.
 * Past planned-only days stay empty (no compliance); planned outlines are for today+.
 */
export function computeActivityGlance(
  recent: ActivityListItem[] | undefined,
  planned: PlannedListItem[] | undefined,
  now = new Date()
): ActivityGlance {
  const { startKey, endKey, weekStarts } = activityGlanceRange(now);
  const todayKey = localDateKey(startOfLocalDay(now))!;

  const activitiesByDay = new Map<string, string[]>();
  const plannedByDay = new Map<string, string[]>();

  for (const item of recent ?? []) {
    const key = localDateKey(item.date);
    if (!key || key < startKey || key > endKey) continue;
    const list = activitiesByDay.get(key) ?? [];
    list.push(item.id);
    activitiesByDay.set(key, list);
  }

  for (const item of planned ?? []) {
    const key = localDateKey(item.date);
    if (!key || key < startKey || key > endKey) continue;
    const list = plannedByDay.get(key) ?? [];
    list.push(item.id);
    plannedByDay.set(key, list);
  }

  let doneDayCount = 0;
  let plannedDayCount = 0;

  const weeks: ActivityGlanceWeek[] = weekStarts.map((weekStart) => {
    const weekStartKey = localDateKey(weekStart)!;
    const days: ActivityGlanceDay[] = [];
    for (let i = 0; i < 7; i += 1) {
      const dateKey = localDateKey(addLocalDays(weekStart, i))!;
      const activityIds = activitiesByDay.get(dateKey) ?? [];
      const plannedIds = plannedByDay.get(dateKey) ?? [];
      const hasDone = activityIds.length > 0;
      const isToday = dateKey === todayKey;
      const isFuture = dateKey > todayKey;
      // Planned outline for today/future only; past misses stay empty (no compliance UI).
      const hasPlanned = !hasDone && plannedIds.length > 0 && dateKey >= todayKey;

      if (hasDone) doneDayCount += 1;
      if (hasPlanned) plannedDayCount += 1;

      days.push({
        dateKey,
        hasDone,
        hasPlanned,
        isToday,
        isFuture,
        activityIds,
        plannedIds,
      });
    }
    return { weekStartKey, days };
  });

  const summaryLine = `${doneDayCount} done · ${plannedDayCount} planned`;

  return {
    weeks,
    startKey,
    endKey,
    doneDayCount,
    plannedDayCount,
    summaryLine,
  };
}

export type ActivityGlanceTapTarget =
  | { kind: 'activity'; id: string }
  | { kind: 'planned'; id: string }
  | { kind: 'recent' }
  | { kind: 'upcoming' };

export function resolveActivityGlanceTap(day: ActivityGlanceDay): ActivityGlanceTapTarget {
  if (day.activityIds.length === 1 && day.plannedIds.length === 0) {
    return { kind: 'activity', id: day.activityIds[0]! };
  }
  if (day.activityIds.length === 1 && day.hasDone) {
    return { kind: 'activity', id: day.activityIds[0]! };
  }
  if (!day.hasDone && day.plannedIds.length === 1) {
    return { kind: 'planned', id: day.plannedIds[0]! };
  }
  if (day.activityIds.length > 1) {
    return { kind: 'recent' };
  }
  if (day.plannedIds.length > 1) {
    return { kind: 'upcoming' };
  }
  if (day.isFuture || (day.hasPlanned && !day.hasDone)) {
    return { kind: 'upcoming' };
  }
  return { kind: 'recent' };
}
