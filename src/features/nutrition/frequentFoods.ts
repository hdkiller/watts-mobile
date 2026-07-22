export type FrequentFoodItem = {
  id: string;
  name: string;
  emoji: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export const COMMON_FREQUENT_FOODS: FrequentFoodItem[] = [
  { id: 'banana', name: 'Banana', emoji: '🍌', calories: 105, carbs: 27, protein: 1.3, fat: 0.3 },
  { id: 'oatmeal', name: 'Oatmeal & Honey', emoji: '🥣', calories: 280, carbs: 54, protein: 10, fat: 5 },
  { id: 'protein_shake', name: 'Whey Protein Shake', emoji: '🥤', calories: 140, carbs: 3, protein: 25, fat: 2 },
  { id: 'eggs_toast', name: 'Eggs & Whole Wheat Toast', emoji: '🍳', calories: 320, carbs: 24, protein: 18, fat: 16 },
  { id: 'chicken_rice', name: 'Chicken Breast & Rice', emoji: '🍚', calories: 450, carbs: 48, protein: 42, fat: 6 },
  { id: 'greek_yogurt', name: 'Greek Yogurt & Berries', emoji: '🫐', calories: 180, carbs: 18, protein: 15, fat: 2 },
  { id: 'energy_bar', name: 'Energy Bar / Gel', emoji: '⚡', calories: 210, carbs: 45, protein: 5, fat: 3 },
  { id: 'apple_almonds', name: 'Apple & Almonds', emoji: '🍎', calories: 200, carbs: 25, protein: 4, fat: 10 },
];
