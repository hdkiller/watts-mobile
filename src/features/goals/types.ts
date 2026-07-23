export type GoalType = 'BODY_COMPOSITION' | 'EVENT' | 'PERFORMANCE' | 'CONSISTENCY';

export type GoalLinkedEventApi = {
  id: string;
  title?: string | null;
  date?: string | Date | null;
};

export type GoalApi = {
  id: string;
  type: GoalType | string;
  title: string;
  description?: string | null;
  targetDate?: string | null;
  status?: string;
  metric?: string | null;
  startValue?: number | null;
  currentValue?: number | null;
  targetValue?: number | null;
  priority?: string;
  /** Present on GET /api/goals; used for primary-goal ordering. */
  createdAt?: string | Date | null;
  events?: GoalLinkedEventApi[] | null;
};

export type GoalLinkedEvent = {
  id: string;
  title: string;
  dateLabel: string | null;
};

export type GoalGlance = {
  id: string;
  title: string;
  type: string;
  typeLabel: string;
  /** Short code for list tile (e.g. PERF). */
  typeShort: string;
  targetDateLabel: string | null;
  status: string | null;
  statusLabel: string | null;
  priority: string | null;
  priorityLabel: string | null;
};

export type GoalDetail = GoalGlance & {
  description: string | null;
  metric: string | null;
  startValue: number | null;
  currentValue: number | null;
  targetValue: number | null;
  linkedEvents: GoalLinkedEvent[];
};

export type CreateGoalInput = {
  type: GoalType;
  title: string;
  targetDate?: string;
  description?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  metric?: string;
  targetValue?: number;
  startValue?: number;
  eventData?: {
    title: string;
    date: string;
    type?: string;
  };
};
