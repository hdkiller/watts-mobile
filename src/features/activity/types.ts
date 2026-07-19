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

/** Raw planned detail from `GET /api/planned-workouts/:id`. */
export type PlannedDetailApi = PlannedListItemApi & {
  structuredWorkout?: unknown;
  completionStatus?: string | null;
  syncStatus?: string | null;
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

export type ActivitySummary = ActivityListItem & {
  description: string | null;
  loadLabel: string | null;
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

export type PlannedDetail = PlannedListItem & {
  description: string | null;
  structureSteps: PlannedStructureStep[];
};

export const RECENT_ACTIVITY_LIMIT = 10;
export const UPCOMING_PLANNED_LIMIT = 20;
export const UPCOMING_WINDOW_DAYS = 14;
