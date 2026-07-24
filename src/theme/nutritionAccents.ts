import { Colors } from '@/src/theme/colors';

/**
 * Nutrition macro / hydration accents — theme-invariant named tokens.
 * Prefer these (or Tailwind `macro-*` / `hydration`) over raw hex in UI.
 */
export const NutritionAccents = {
  calories: Colors.macroCalories,
  carbs: Colors.macroCarbs,
  protein: Colors.macroProtein,
  fat: Colors.macroFat,
  hydration: Colors.hydration,
} as const;

export const NutritionAccentClasses = {
  calories: { text: 'text-macro-calories', bg: 'bg-macro-calories' },
  carbs: { text: 'text-macro-carbs', bg: 'bg-macro-carbs' },
  protein: { text: 'text-macro-protein', bg: 'bg-macro-protein' },
  fat: { text: 'text-macro-fat', bg: 'bg-macro-fat' },
  hydration: { text: 'text-hydration', bg: 'bg-hydration' },
} as const;
