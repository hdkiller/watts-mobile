export type MealSlot = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK' | 'OTHER';

export type NutritionDayTotals = {
  id: string | null;
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  waterMl: number;
  isEmpty: boolean;
  /** Canonical fueling-plan targets from GET /api/nutrition; null when no plan for the day. */
  caloriesGoal: number | null;
  proteinGoal: number | null;
  carbsGoal: number | null;
  fatGoal: number | null;
  fluidGoalMl: number | null;
  hasGoals: boolean;
  /** Fueling periodization state for the day: 1 = Eco, 2 = Steady, 3 = Performance. */
  fuelState: 1 | 2 | 3 | null;
};

export type NextFuelingWindow = {
  /** e.g. "Dinner", "Pre-workout", "Intra-workout" */
  label: string;
  startTime: string; // ISO
  targetCarbs: number;
  targetProtein: number;
  workoutTitle: string | null;
};

export type NutritionItemPayload = {
  name?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  meal?: MealSlot;
  logged_at: string;
};

export type NutritionUploadPayload = {
  date: string;
  items: NutritionItemPayload[];
};

export type HydrationQuickAddPayload = {
  date: string;
  volumeMl: number;
};

export type NutritionQuickLogForm = {
  meal: MealSlot;
  name: string;
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
};

export const MEAL_OPTIONS: { value: MealSlot; label: string }[] = [
  { value: 'BREAKFAST', label: 'Breakfast' },
  { value: 'LUNCH', label: 'Lunch' },
  { value: 'DINNER', label: 'Dinner' },
  { value: 'SNACK', label: 'Snack' },
  { value: 'OTHER', label: 'Other' },
];

export const HYDRATION_QUICK_ML = [250, 500, 750] as const;
