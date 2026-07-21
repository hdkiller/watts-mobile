export type GoalType = 'BODY_COMPOSITION' | 'EVENT' | 'PERFORMANCE' | 'CONSISTENCY';

export type GoalApi = {
  id: string;
  type: GoalType | string;
  title: string;
  targetDate?: string | null;
  status?: string;
  metric?: string | null;
  targetValue?: number | null;
  priority?: string;
};

export type CreateGoalInput = {
  type: GoalType;
  title: string;
  targetDate?: string;
  metric?: string;
  targetValue?: number;
  eventData?: {
    title: string;
    date: string;
    type?: string;
  };
};
