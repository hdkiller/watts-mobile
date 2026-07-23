import type { ActivityLevel, BaseCaloriesMode, GoalProfile } from './nutritionSettingsTypes';

export type LabeledOption<T extends string = string> = { label: string; value: T };

export const ACTIVITY_LEVEL_OPTIONS: LabeledOption<ActivityLevel>[] = [
  { label: 'Sedentary', value: 'SEDENTARY' },
  { label: 'Lightly Active', value: 'LIGHTLY_ACTIVE' },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Moderately Active', value: 'MODERATELY_ACTIVE' },
  { label: 'Very Active', value: 'VERY_ACTIVE' },
  { label: 'Extra Active', value: 'EXTRA_ACTIVE' },
];

export const BASE_CALORIES_MODE_OPTIONS: LabeledOption<BaseCaloriesMode>[] = [
  { label: 'Auto (BMR × Activity)', value: 'AUTO' },
  { label: 'Manual (No Exercise Baseline)', value: 'MANUAL_NON_EXERCISE' },
];

export const GOAL_PROFILE_OPTIONS: LabeledOption<GoalProfile>[] = [
  { label: 'Lose Weight', value: 'LOSE' },
  { label: 'Maintain', value: 'MAINTAIN' },
  { label: 'Gain Muscle', value: 'GAIN' },
];

export const DIETARY_OPTIONS: LabeledOption[] = [
  { label: 'Vegan', value: 'VEGAN' },
  { label: 'Vegetarian', value: 'VEGETARIAN' },
  { label: 'Gluten-Free', value: 'GLUTEN_FREE' },
  { label: 'Dairy-Free', value: 'DAIRY_FREE' },
  { label: 'Low-FODMAP', value: 'LOW_FODMAP' },
  { label: 'Keto', value: 'KETO' },
  { label: 'Paleo', value: 'PALEO' },
  { label: 'Mediterranean', value: 'MEDITERRANEAN' },
  { label: 'Halal', value: 'HALAL' },
  { label: 'Kosher', value: 'KOSHER' },
];

export const ALLERGY_OPTIONS: LabeledOption[] = [
  { label: 'Peanuts', value: 'PEANUTS' },
  { label: 'Tree Nuts', value: 'TREE_NUTS' },
  { label: 'Milk / Dairy', value: 'MILK' },
  { label: 'Eggs', value: 'EGGS' },
  { label: 'Wheat', value: 'WHEAT' },
  { label: 'Soy', value: 'SOY' },
  { label: 'Fish', value: 'FISH' },
  { label: 'Shellfish', value: 'SHELLFISH' },
  { label: 'Sesame', value: 'SESAME' },
  { label: 'Mustard', value: 'MUSTARD' },
  { label: 'Celery', value: 'CELERY' },
];

export const INTOLERANCE_OPTIONS: LabeledOption[] = [
  { label: 'Lactose', value: 'LACTOSE' },
  { label: 'Fructose', value: 'FRUCTOSE' },
  { label: 'Histamine', value: 'HISTAMINE' },
  { label: 'Nightshades', value: 'NIGHTSHADES' },
  { label: 'Sulfites', value: 'SULFITES' },
  { label: 'Yeast', value: 'YEAST' },
  { label: 'Legumes / Beans', value: 'LEGUMES' },
  { label: 'Artificial Sweeteners', value: 'SWEETENERS' },
];

export const LIFESTYLE_OPTIONS: LabeledOption[] = [
  { label: 'No Alcohol', value: 'NO_ALCOHOL' },
  { label: 'No Caffeine', value: 'NO_CAFFEINE' },
  { label: 'No Refined Sugar', value: 'NO_REFINED_SUGAR' },
  { label: 'No Seed Oils', value: 'NO_SEED_OILS' },
  { label: 'No Processed Foods', value: 'NO_PROCESSED_FOODS' },
  { label: 'No Artificial Sweeteners', value: 'NO_SWEETENERS' },
  { label: 'No Carbonated Drinks', value: 'NO_SODA' },
  { label: 'No Pork', value: 'NO_PORK' },
  { label: 'No Red Meat', value: 'NO_RED_MEAT' },
];

export const SUPPLEMENT_OPTIONS: LabeledOption[] = [
  { label: 'Caffeine', value: 'caffeine' },
  { label: 'Nitrates / Beetroot', value: 'nitrates' },
  { label: 'Beta-Alanine', value: 'beta_alanine' },
  { label: 'Creatine', value: 'creatine' },
  { label: 'Sodium Bicarbonate', value: 'sodium_bicarbonate' },
  { label: 'Glycerol', value: 'glycerol' },
  { label: 'Electrolytes', value: 'electrolytes' },
  { label: 'Omega-3', value: 'omega_3' },
  { label: 'Vitamin D', value: 'vitamin_d' },
  { label: 'Iron', value: 'iron' },
  { label: 'Magnesium', value: 'magnesium' },
  { label: 'Tart Cherry', value: 'tart_cherry' },
  { label: 'Collagen', value: 'collagen' },
  { label: 'Probiotics', value: 'probiotics' },
  { label: 'CoQ10', value: 'coq10' },
];

export const TRAINING_PHASE_OPTIONS: LabeledOption[] = [
  { label: 'Base Phase', value: 'BASE' },
  { label: 'Build Phase', value: 'BUILD' },
  { label: 'Taper / Race Week', value: 'RACE' },
  { label: 'Custom', value: 'CUSTOM' },
];

export const PHASE_PRESETS: Record<
  string,
  { baseProteinPerKg: number; baseFatPerKg: number; carbScalingFactor: number }
> = {
  BASE: { baseProteinPerKg: 1.8, baseFatPerKg: 1.2, carbScalingFactor: 0.8 },
  BUILD: { baseProteinPerKg: 1.6, baseFatPerKg: 0.9, carbScalingFactor: 1.1 },
  RACE: { baseProteinPerKg: 1.4, baseFatPerKg: 0.6, carbScalingFactor: 1.4 },
};

/** Mirrors web NutritionSettings.vue palMultipliers (ACTIVE falls back to 1.2). */
export const PAL_MULTIPLIERS: Record<string, number> = {
  SEDENTARY: 1.2,
  LIGHTLY_ACTIVE: 1.375,
  MODERATELY_ACTIVE: 1.55,
  VERY_ACTIVE: 1.725,
  EXTRA_ACTIVE: 1.9,
};
