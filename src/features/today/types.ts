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

/** Glance sentiment for sleep / HRV / feel tiles. */
export type RecoverySentiment = 'good' | 'ok' | 'poor';

export type TodayRecoveryStrip = {
  sleepLabel: string | null;
  hrvLabel: string | null;
  feelLabel: string | null;
  sleepSentiment: RecoverySentiment | null;
  hrvSentiment: RecoverySentiment | null;
  feelSentiment: RecoverySentiment | null;
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

export type SuggestedModificationsApi = {
  description?: string;
  new_type?: string;
  new_title?: string;
  new_duration_min?: number;
  new_tss?: number;
};

export type AnalysisPlannedWorkoutApi = {
  original_title?: string;
  original_duration_min?: number;
  original_tss?: number;
};

export type RecommendationRecoveryAnalysis = {
  hrv_status?: string | null;
  sleep_quality?: string | null;
  fatigue_level?: string | null;
  readiness_score?: number | null;
};

export type ActivityRecommendationApi = {
  id: string;
  recommendation?: string | null;
  confidence?: number | null;
  reasoning?: string | null;
  status?: string | null;
  userAccepted?: boolean | null;
  analysisJson?: {
    key_factors?: string[] | null;
    planned_workout?: AnalysisPlannedWorkoutApi | null;
    suggested_modifications?: SuggestedModificationsApi | null;
    recovery_context?: Record<string, unknown> | null;
    recovery_analysis?: RecommendationRecoveryAnalysis | null;
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

/** Plain-language driver row for the recommendation detail sheet. */
export type RecommendationDriverRow = {
  id: string;
  kind: 'recovery' | 'factor' | 'fuel';
  /** Short coaching label when present (e.g. "Sleep quality"); null for free-text factors. */
  label: string | null;
  value: string;
};

/** Detail sheet view model mapped from today recommendation + analysisJson. */
export type RecommendationDetailViewModel = {
  recommendationId: string;
  action: RecommendationAction | null;
  actionLabel: string;
  reasoning: string | null;
  confidence: number | null;
  confidencePercent: number | null;
  userAccepted: boolean;
  canAccept: boolean;
  /** Raw key_factors for tests/back-compat; prefer `drivers` in UI. */
  keyFactors: string[];
  /** recovery_analysis fields when present — recommendation inputs, not live biometrics. */
  recoveryAnalysis: RecommendationRecoveryAnalysis | null;
  /** Ordered driver rows (recovery + factors); fuel appended by the sheet when known. */
  drivers: RecommendationDriverRow[];
  originalPlan: {
    title: string;
    durationMin: number | null;
    tss: number | null;
  } | null;
  suggestedChanges: {
    title: string | null;
    durationMin: number | null;
    tss: number | null;
    description: string | null;
  } | null;
};
