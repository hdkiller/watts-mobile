export type ActivityLevel =
  | 'SEDENTARY'
  | 'LIGHTLY_ACTIVE'
  | 'ACTIVE'
  | 'MODERATELY_ACTIVE'
  | 'VERY_ACTIVE'
  | 'EXTRA_ACTIVE';

export type BaseCaloriesMode = 'AUTO' | 'MANUAL_NON_EXERCISE';
export type GoalProfile = 'LOSE' | 'MAINTAIN' | 'GAIN';

export type MealPatternItem = {
  name: string;
  time: string;
};

export type NutritionSettingsForm = {
  nutritionTrackingEnabled: boolean;
  bmr: number;
  activityLevel: ActivityLevel;
  baseCaloriesMode: BaseCaloriesMode;
  nonExerciseBaseCalories: number | null;
  currentCarbMax: number;
  ultimateCarbGoal: number;
  baseProteinPerKg: number;
  baseFatPerKg: number;
  sweatRate: number;
  sodiumTarget: number;
  quickAddVolumes: [number, number, number];
  preWorkoutWindow: number;
  postWorkoutWindow: number;
  carbsPerHourLow: number;
  carbsPerHourMedium: number;
  carbsPerHourHigh: number;
  carbScalingFactor: number;
  fuelingSensitivity: number;
  fuelState1Trigger: number;
  fuelState1Min: number;
  fuelState1Max: number;
  fuelState2Trigger: number;
  fuelState2Min: number;
  fuelState2Max: number;
  fuelState3Min: number;
  fuelState3Max: number;
  metabolicFloor: number;
  enabledSupplements: string[];
  goalProfile: GoalProfile;
  targetAdjustmentPercent: number;
  mealPattern: MealPatternItem[];
  dietaryProfile: string[];
  foodAllergies: string[];
  foodIntolerances: string[];
  lifestyleExclusions: string[];
};

export type NutritionSettingsPayload = NutritionSettingsForm;

export type NutritionSettingsState = NutritionSettingsForm & {
  weightKg: number;
};

export const DEFAULT_QUICK_ADD_VOLUMES: [number, number, number] = [250, 500, 750];

export const DEFAULT_NUTRITION_SETTINGS_FORM: NutritionSettingsForm = {
  nutritionTrackingEnabled: false,
  bmr: 1600,
  activityLevel: 'ACTIVE',
  baseCaloriesMode: 'AUTO',
  nonExerciseBaseCalories: null,
  baseProteinPerKg: 1.6,
  baseFatPerKg: 1.0,
  currentCarbMax: 60,
  ultimateCarbGoal: 90,
  sweatRate: 0.8,
  sodiumTarget: 750,
  quickAddVolumes: [...DEFAULT_QUICK_ADD_VOLUMES],
  preWorkoutWindow: 120,
  postWorkoutWindow: 60,
  carbsPerHourLow: 30,
  carbsPerHourMedium: 60,
  carbsPerHourHigh: 90,
  carbScalingFactor: 1.0,
  fuelingSensitivity: 1.0,
  fuelState1Trigger: 0.7,
  fuelState1Min: 2.5,
  fuelState1Max: 4.0,
  fuelState2Trigger: 0.85,
  fuelState2Min: 4.5,
  fuelState2Max: 6.5,
  fuelState3Min: 7.0,
  fuelState3Max: 10.0,
  metabolicFloor: 0.6,
  enabledSupplements: [],
  goalProfile: 'MAINTAIN',
  targetAdjustmentPercent: 0,
  mealPattern: [
    { name: 'Breakfast', time: '07:00' },
    { name: 'Lunch', time: '12:00' },
    { name: 'Dinner', time: '18:00' },
    { name: 'Snack', time: '15:00' },
  ],
  dietaryProfile: [],
  foodAllergies: [],
  foodIntolerances: [],
  lifestyleExclusions: [],
};
