import AsyncStorage from '@react-native-async-storage/async-storage';

import { COMMON_FREQUENT_FOODS, type FrequentFoodItem } from './frequentFoods';

export const MEAL_HISTORY_STORAGE_KEY = '@watts_user_meal_history';
const MAX_HISTORY_ITEMS = 20;

export type UserMealHistoryItem = {
  id: string;
  name: string;
  emoji?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  count: number;
  lastLoggedAt: string;
};

/** Load user's personal meal history from AsyncStorage. Defaults to starter presets if empty. */
export async function getMealHistory(): Promise<UserMealHistoryItem[]> {
  try {
    const raw = await AsyncStorage.getItem(MEAL_HISTORY_STORAGE_KEY);
    if (!raw) {
      return COMMON_FREQUENT_FOODS.map((food) => ({
        ...food,
        count: 1,
        lastLoggedAt: new Date().toISOString(),
      }));
    }
    const items = JSON.parse(raw) as UserMealHistoryItem[];
    if (!Array.isArray(items) || items.length === 0) {
      return COMMON_FREQUENT_FOODS.map((food) => ({
        ...food,
        count: 1,
        lastLoggedAt: new Date().toISOString(),
      }));
    }
    return items;
  } catch {
    return COMMON_FREQUENT_FOODS.map((food) => ({
      ...food,
      count: 1,
      lastLoggedAt: new Date().toISOString(),
    }));
  }
}

/** Record a newly logged meal into user's personal history. */
export async function saveMealToHistory(meal: {
  name: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}): Promise<UserMealHistoryItem[]> {
  const nameTrimmed = meal.name.trim();
  if (!nameTrimmed) return getMealHistory();

  try {
    const existing = await getMealHistory();
    const normalizedNew = nameTrimmed.toLowerCase();

    // Check if item already exists in history
    const matchIndex = existing.findIndex((item) => item.name.toLowerCase() === normalizedNew);

    let updated: UserMealHistoryItem[];
    const now = new Date().toISOString();

    if (matchIndex >= 0) {
      const match = existing[matchIndex];
      const updatedMatch: UserMealHistoryItem = {
        ...match,
        name: nameTrimmed, // preserve latest capitalization
        calories: meal.calories ?? match.calories,
        protein: meal.protein ?? match.protein,
        carbs: meal.carbs ?? match.carbs,
        fat: meal.fat ?? match.fat,
        count: match.count + 1,
        lastLoggedAt: now,
      };
      // Move updated item to the front of history
      updated = [updatedMatch, ...existing.filter((_, i) => i !== matchIndex)];
    } else {
      const newItem: UserMealHistoryItem = {
        id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: nameTrimmed,
        emoji: '🍽️',
        calories: meal.calories ?? 0,
        protein: meal.protein ?? 0,
        carbs: meal.carbs ?? 0,
        fat: meal.fat ?? 0,
        count: 1,
        lastLoggedAt: now,
      };
      updated = [newItem, ...existing];
    }

    // Limit history length
    const trimmed = updated.slice(0, MAX_HISTORY_ITEMS);
    await AsyncStorage.setItem(MEAL_HISTORY_STORAGE_KEY, JSON.stringify(trimmed));
    return trimmed;
  } catch {
    return getMealHistory();
  }
}

/** Clear stored meal history. */
export async function clearMealHistory(): Promise<void> {
  try {
    await AsyncStorage.removeItem(MEAL_HISTORY_STORAGE_KEY);
  } catch {
    // ignore
  }
}
