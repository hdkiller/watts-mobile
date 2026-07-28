export type VolumePreference = 'LOW' | 'MID' | 'HIGH';

export type PlanStrategy =
  'LINEAR' | 'UNDULATING' | 'BLOCK' | 'POLARIZED' | 'REVERSE' | 'MAINTENANCE';

export type StartingPhase = 'BASE' | 'BUILD' | 'PEAK';

export type PlanInitializeInput = {
  goalId: string;
  startDate: string;
  volumePreference: VolumePreference;
  preferredActivityTypes: string[];
  volumeHours?: number;
  endDate?: string;
  strategy?: PlanStrategy;
  customInstructions?: string;
  recoveryRhythm?: number;
  startingPhase?: StartingPhase;
};

export type PlannedWorkoutPreview = {
  id?: string;
  title?: string | null;
  type?: string | null;
  date?: string | null;
  duration?: number | null;
  durationSec?: number | null;
  tss?: number | null;
  structuredWorkout?: unknown;
};

export type PlanInitializeResult = {
  planId: string;
  plan?: {
    id: string;
    blocks?: {
      id?: string;
      name?: string | null;
      type?: string | null;
      startDate?: string | Date | null;
      durationWeeks?: number | null;
      weeks?: {
        id?: string;
        workouts?: PlannedWorkoutPreview[];
        startDate?: string;
        weekNumber?: number;
      }[];
    }[];
  };
};

export type PlanAdaptationType = 'RECALCULATE_WEEK' | 'PUSH_FORWARD';

export type TrainingBlockType = 'BASE' | 'BUILD' | 'PEAK' | 'RACE' | 'TRANSITION' | string;

export type PlanBlockApi = {
  id: string;
  order?: number | null;
  name?: string | null;
  type?: TrainingBlockType | null;
  primaryFocus?: string | null;
  startDate?: string | Date | null;
  durationWeeks?: number | null;
  recoveryWeekIndex?: number | null;
  progressionLogic?: string | null;
  weeks?: PlanWeekApi[] | null;
};

export type PlanWeekApi = {
  id: string;
  weekNumber?: number | null;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  volumeTargetMinutes?: number | null;
  tssTarget?: number | null;
  isRecovery?: boolean | null;
  focus?: string | null;
  focusKey?: string | null;
  focusLabel?: string | null;
  explanation?: string | null;
  workouts?: PlannedWorkoutPreview[] | null;
};

export type ActivePlanApi = {
  id: string;
  name?: string | null;
  status?: string | null;
  startDate?: string | Date | null;
  targetDate?: string | Date | null;
  strategy?: string | null;
  currentBlockId?: string | null;
  description?: string | null;
  coachNotes?: string | null;
  goal?: { id?: string; title?: string | null; events?: unknown[] } | null;
  blocks?: PlanBlockApi[] | null;
};

export type ActivePlanResponse = {
  plan: ActivePlanApi | null;
  userFtp?: number | null;
};

export type PlanBlockShell = {
  id: string;
  order: number;
  name: string;
  type: string;
  primaryFocus: string | null;
  durationWeeks: number;
  startDateKey: string | null;
  /** Recovery cadence for timeline sparkline (web default 4). */
  recoveryWeekIndex: number | null;
};

export type PlanWeekShell = {
  id: string;
  blockId: string;
  weekNumber: number;
  startDateKey: string | null;
  endDateKey: string | null;
  focusLabel: string | null;
  volumeTargetMinutes: number | null;
  tssTarget: number | null;
  isRecovery: boolean;
  explanation: string | null;
};

export type ActivePlanShell = {
  id: string;
  title: string;
  strategy: string | null;
  startDateKey: string | null;
  targetDateKey: string | null;
  currentPhaseLabel: string | null;
  coachNotes: string | null;
  blocks: PlanBlockShell[];
  /** Flattened season weeks (chronological) for week navigation. */
  weeks: PlanWeekShell[];
  /** Week containing today, else nearest upcoming, else last past. */
  currentWeek: PlanWeekShell | null;
  provisionalHint: boolean;
};

export type WeekTuneInput = {
  focusKey?: string;
  focusLabel?: string;
  volumeTargetMinutes?: number;
  tssTarget?: number;
  isRecovery?: boolean;
};

export type BlockCreateInput = {
  name: string;
  type: string;
  primaryFocus: string;
  durationWeeks: number;
  order?: number;
  recoveryWeekIndex?: number | null;
  progressionLogic?: string | null;
};

export type BlockPatchInput = {
  name?: string;
  type?: string;
  primaryFocus?: string;
  durationWeeks?: number;
  recoveryWeekIndex?: number | null;
  progressionLogic?: string | null;
};

export type ReplanBlockInput = {
  id?: string;
  name: string;
  type: string;
  primaryFocus: string;
  durationWeeks: number;
  order: number;
  recoveryWeekIndex?: number | null;
  progressionLogic?: string | null;
};

/** Nutrition plan (weekly meals). */
export type NutritionPlanMealApi = {
  id: string;
  date?: string | Date | null;
  windowType?: string | null;
  scheduledAt?: string | Date | null;
  status?: string | null;
  targetJson?: unknown;
  mealJson?: unknown;
};

export type NutritionPlanApi = {
  id: string;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  status?: string | null;
  summaryJson?: unknown;
  meals?: NutritionPlanMealApi[] | null;
};

export type NutritionPlanMealView = {
  id: string;
  dateKey: string;
  windowType: string;
  status: string;
  title: string;
  scheduledLabel: string | null;
  /** Raw mealJson for replace/lock payloads when present. */
  mealPayload?: unknown;
};

/** One fueling window for the day sheet — may or may not hold a locked meal. */
export type NutritionPlanWindowView = {
  key: string;
  /** Semantic type used for catalog bucketing and labels, e.g. `PRE_WORKOUT`. */
  windowType: string;
  /**
   * Stable per-day identity, e.g. `PRE_WORKOUT#2` or `DAILY_BASE:breakfast`. A day can hold
   * several windows of the same type, so the type alone cannot address one of them.
   */
  windowKey: string;
  label: string;
  slotName: string | null;
  /** ISO start of the window, used to order the day chronologically. */
  startTime: string | null;
  scheduledLabel: string | null;
  targetCarbs: number;
  targetProtein: number;
  targetKcal: number;
  meal: NutritionPlanMealView | null;
};

export type NutritionPlanDayView = {
  dateKey: string;
  weekdayLabel: string;
  windows: NutritionPlanWindowView[];
  /** Derived from windows with a locked meal — used by week summary + empty-week hint. */
  meals: NutritionPlanMealView[];
  plannedCount: number;
  doneCount: number;
  skippedCount: number;
  targetCarbsTotal?: number;
  plannedCarbsTotal?: number;
  workoutTitles?: string[];
};

export type MealRecommendationOption = {
  title: string;
  totals?: {
    kcal?: number;
    carbs?: number;
    protein?: number;
    fat?: number;
  };
  [key: string]: unknown;
};

export type GroceryItemView = {
  ingredient: string;
  quantity: number | null;
  unit: string | null;
  category: string | null;
  sourceLabels: string[];
};
