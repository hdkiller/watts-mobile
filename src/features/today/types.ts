export type RecommendationAction = 'proceed' | 'modify' | 'reduce_intensity' | 'rest' | string;

export type TodayPlannedWorkout = {
  id: string;
  title: string;
  type: string | null;
  date: string | null;
  durationSec: number | null;
  tss: number | null;
  description: string | null;
  structureSummary: string | null;
};

export type TodayRecoveryStrip = {
  sleepLabel: string | null;
  hrvLabel: string | null;
  feelLabel: string | null;
};

export type TodayViewModel = {
  recommendationId: string | null;
  action: RecommendationAction | null;
  actionLabel: string;
  rationale: string | null;
  confidence: number | null;
  status: string | null;
  userAccepted: boolean;
  canAccept: boolean;
  modificationSummary: string | null;
  plannedWorkout: TodayPlannedWorkout | null;
  recovery: TodayRecoveryStrip;
  raw: unknown;
};

export type ActivityRecommendationApi = {
  id: string;
  recommendation?: string | null;
  confidence?: number | null;
  reasoning?: string | null;
  status?: string | null;
  userAccepted?: boolean | null;
  analysisJson?: {
    suggested_modifications?: {
      description?: string;
      new_type?: string;
      new_title?: string;
    } | null;
    recovery_context?: Record<string, unknown> | null;
  } | null;
  plannedWorkout?: {
    id: string;
    title?: string | null;
    type?: string | null;
    date?: string | Date | null;
    durationSec?: number | null;
    tss?: number | null;
    description?: string | null;
    structure?: unknown;
  } | null;
};
