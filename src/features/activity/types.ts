export type WorkoutAnalysisStatus =
  | 'NOT_STARTED'
  | 'PENDING'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED'
  | string;

/** Raw workout row from `GET /api/workouts`. */
export type WorkoutListItemApi = {
  id: string;
  title?: string | null;
  date?: string | Date | null;
  type?: string | null;
  durationSec?: number | null;
  tss?: number | null;
  trainingLoad?: number | null;
  aiAnalysisStatus?: WorkoutAnalysisStatus | null;
  streams?: { id?: string } | null;
  source?: string | null;
};

/** Raw planned row from `GET /api/planned-workouts`. */
export type PlannedListItemApi = {
  id: string;
  title?: string | null;
  date?: string | Date | null;
  type?: string | null;
  description?: string | null;
  durationSec?: number | null;
  tss?: number | null;
  trainingWeekId?: string | null;
};

/** Raw workout detail from `GET /api/workouts/:id` (streams optional). */
export type WorkoutSummaryApi = WorkoutListItemApi & {
  description?: string | null;
  distanceMeters?: number | null;
  averageWatts?: number | null;
  normalizedPower?: number | null;
  averageHr?: number | null;
  elevationGain?: number | null;
  /** Intensity factor on the workout row (not `intensityFactor`). */
  intensity?: number | null;
  aiAnalysis?: string | null;
  aiAnalysisJson?: unknown;
  aiAnalyzedAt?: string | Date | null;
  overallScore?: number | null;
  technicalScore?: number | null;
  effortScore?: number | null;
  pacingScore?: number | null;
  executionScore?: number | null;
};

/** Raw planned detail from `GET /api/planned-workouts/:id`. */
export type PlannedDetailApi = PlannedListItemApi & {
  structuredWorkout?: unknown;
  completionStatus?: string | null;
  syncStatus?: string | null;
  /** Planned intensity factor (Prisma `workIntensity`, not `intensityFactor`). */
  workIntensity?: number | null;
};

export type ActivityRowStatus = {
  /** Short label for list rows */
  label: string;
  /** Stable key for tests / styling */
  kind: 'ready' | 'processing' | 'failed' | 'uploaded' | 'unknown';
};

export type ActivityListItem = {
  id: string;
  title: string;
  date: string | null;
  type: string | null;
  durationSec: number | null;
  tss: number | null;
  trainingLoad: number | null;
  status: ActivityRowStatus;
};

export type SummaryMetric = {
  key: string;
  label: string;
  value: string;
};

export type AnalysisPhase =
  | 'ready'
  | 'analyzing'
  | 'failed'
  | 'quota'
  | 'not_started'
  | 'unknown';

export type AnalysisScore = {
  key: string;
  label: string;
  value: number;
};

export type AnalysisSection = {
  title: string;
  statusLabel: string | null;
  points: string[];
};

export type AnalysisRecommendation = {
  title: string;
  description: string;
  priority: string | null;
};

export type ActivityAnalysis = {
  phase: AnalysisPhase;
  statusLabel: string;
  scores: AnalysisScore[];
  executiveSummary: string | null;
  sections: AnalysisSection[];
  recommendations: AnalysisRecommendation[];
  strengths: string[];
  weaknesses: string[];
  markdownFallback: string | null;
  analyzedAt: string | null;
  /** True when there is athlete-facing body content beyond status. */
  hasContent: boolean;
};

export type ActivitySummary = ActivityListItem & {
  description: string | null;
  loadLabel: string | null;
  /** Present metrics only — empty when none available. */
  metrics: SummaryMetric[];
  analysis: ActivityAnalysis;
};

export type PlannedListItem = {
  id: string;
  title: string;
  date: string | null;
  type: string | null;
  durationSec: number | null;
  tss: number | null;
};

export type PlannedStructureStep = {
  name: string;
  durationSec: number | null;
  intensityLabel: string | null;
};

export type PlannedZoneBand = {
  name: string;
  rangeLabel: string;
};

export type PlannedZoneSummary = {
  channelLabel: string;
  bands: PlannedZoneBand[];
};

export type PlannedDetail = PlannedListItem & {
  description: string | null;
  structureSteps: PlannedStructureStep[];
  workIntensityLabel: string | null;
  completionLabel: string | null;
  syncLabel: string | null;
  coachInstructions: string | null;
  zoneSummary: PlannedZoneSummary | null;
};

export const RECENT_ACTIVITY_LIMIT = 10;
export const UPCOMING_PLANNED_LIMIT = 20;
export const UPCOMING_WINDOW_DAYS = 14;
