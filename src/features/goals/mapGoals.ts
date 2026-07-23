import type { GoalApi, GoalDetail, GoalGlance, GoalLinkedEvent } from './types';

const TYPE_LABELS: Record<string, string> = {
  BODY_COMPOSITION: 'Body composition',
  EVENT: 'Event',
  PERFORMANCE: 'Performance',
  CONSISTENCY: 'Consistency',
};

const TYPE_SHORT: Record<string, string> = {
  BODY_COMPOSITION: 'BODY',
  EVENT: 'RACE',
  PERFORMANCE: 'PERF',
  CONSISTENCY: 'CONS',
};

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Active',
  COMPLETED: 'Completed',
  ARCHIVED: 'Archived',
  DRAFT: 'Draft',
};

const PRIORITY_LABELS: Record<string, string> = {
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low',
};

export function goalTypeLabel(type: string | undefined | null): string {
  if (!type) return 'Goal';
  return TYPE_LABELS[type] ?? type.replace(/_/g, ' ');
}

export function goalTypeShort(type: string | undefined | null): string {
  if (!type) return 'GOAL';
  return TYPE_SHORT[type] ?? type.slice(0, 4).toUpperCase();
}

export function goalStatusLabel(status: string | undefined | null): string | null {
  if (!status) return null;
  const key = status.toUpperCase();
  return STATUS_LABELS[key] ?? status.replace(/_/g, ' ');
}

export function goalPriorityLabel(priority: string | undefined | null): string | null {
  if (!priority) return null;
  const key = priority.toUpperCase();
  return PRIORITY_LABELS[key] ?? priority.replace(/_/g, ' ');
}

export function goalsWebPath(): string {
  return '/profile/goals';
}

function asDateLabel(value: unknown): string | null {
  if (value == null || value === '') return null;
  const d = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function asLinkedEvents(raw: unknown): GoalLinkedEvent[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const row = item as { id?: unknown; title?: unknown; date?: unknown };
      if (typeof row.id !== 'string') return null;
      return {
        id: row.id,
        title: typeof row.title === 'string' && row.title.trim() ? row.title.trim() : 'Event',
        dateLabel: asDateLabel(row.date),
      };
    })
    .filter((item): item is GoalLinkedEvent => item != null);
}

export function mapGoalGlance(goal: GoalApi): GoalGlance {
  const type = typeof goal.type === 'string' ? goal.type : 'GOAL';
  return {
    id: goal.id,
    title: goal.title?.trim() || 'Untitled goal',
    type,
    typeLabel: goalTypeLabel(type === 'GOAL' ? null : type),
    typeShort: goalTypeShort(type === 'GOAL' ? null : type),
    targetDateLabel: asDateLabel(goal.targetDate),
    status: goal.status ?? null,
    statusLabel: goalStatusLabel(goal.status),
    priority: goal.priority ?? null,
    priorityLabel: goalPriorityLabel(goal.priority),
  };
}

export function mapGoalDetail(goal: GoalApi): GoalDetail {
  const glance = mapGoalGlance(goal);
  return {
    ...glance,
    description: typeof goal.description === 'string' ? goal.description : null,
    metric: goal.metric ?? null,
    startValue: typeof goal.startValue === 'number' ? goal.startValue : null,
    currentValue: typeof goal.currentValue === 'number' ? goal.currentValue : null,
    targetValue: typeof goal.targetValue === 'number' ? goal.targetValue : null,
    linkedEvents: asLinkedEvents(goal.events),
  };
}

export function sortGoalsForList(goals: GoalApi[]): GoalApi[] {
  return [...goals].sort((a, b) => {
    const aDate = a.targetDate ? new Date(String(a.targetDate)).getTime() : Number.POSITIVE_INFINITY;
    const bDate = b.targetDate ? new Date(String(b.targetDate)).getTime() : Number.POSITIVE_INFINITY;
    if (aDate !== bDate) return aDate - bDate;
    return (a.title || '').localeCompare(b.title || '');
  });
}

/** Matches coach-wattz onboarding primary goal: priority desc, then oldest createdAt. */
const PRIORITY_RANK: Record<string, number> = {
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
};

function priorityRank(priority: string | undefined | null): number {
  if (!priority) return 0;
  return PRIORITY_RANK[priority.toUpperCase()] ?? 0;
}

function createdAtMs(value: unknown): number {
  if (value == null || value === '') return Number.POSITIVE_INFINITY;
  const t = value instanceof Date ? value.getTime() : new Date(String(value)).getTime();
  return Number.isFinite(t) ? t : Number.POSITIVE_INFINITY;
}

export function pickPrimaryGoal(goals: GoalApi[] | undefined): GoalApi | null {
  if (!goals?.length) return null;
  return [...goals].sort((a, b) => {
    const rankDiff = priorityRank(b.priority) - priorityRank(a.priority);
    if (rankDiff !== 0) return rankDiff;
    return createdAtMs(a.createdAt) - createdAtMs(b.createdAt);
  })[0] ?? null;
}

export function pickGoalById(goals: GoalApi[] | undefined, id: string | undefined): GoalApi | null {
  if (!goals || !id) return null;
  return goals.find((g) => g.id === id) ?? null;
}
