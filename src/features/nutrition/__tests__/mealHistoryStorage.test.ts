import AsyncStorage from '@react-native-async-storage/async-storage';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  clearMealHistory,
  getMealHistory,
  MEAL_HISTORY_STORAGE_KEY,
  saveMealToHistory,
} from '../mealHistoryStorage';

const storage = new Map<string, string>();

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn(async (key: string) => storage.get(key) ?? null),
    setItem: vi.fn(async (key: string, value: string) => {
      storage.set(key, value);
    }),
    removeItem: vi.fn(async (key: string) => {
      storage.delete(key);
    }),
  },
}));

describe('mealHistoryStorage', () => {
  beforeEach(() => {
    storage.clear();
    vi.clearAllMocks();
  });

  it('returns default starter presets when storage is empty', async () => {
    const history = await getMealHistory();
    expect(history.length).toBeGreaterThan(0);
    expect(history[0].name).toBe('Banana');
  });

  it('saves new meal and places it at top of history', async () => {
    const updated = await saveMealToHistory({
      name: 'Custom Protein Oats',
      calories: 350,
      protein: 20,
      carbs: 50,
      fat: 5,
    });

    expect(updated[0].name).toBe('Custom Protein Oats');
    expect(updated[0].calories).toBe(350);
    expect(updated[0].count).toBe(1);

    const storedRaw = await AsyncStorage.getItem(MEAL_HISTORY_STORAGE_KEY);
    expect(storedRaw).toContain('Custom Protein Oats');
  });

  it('increments count and moves item to front when logging existing meal again', async () => {
    await saveMealToHistory({ name: 'Protein Shake', calories: 150 });
    await saveMealToHistory({ name: 'Greek Yogurt', calories: 120 });
    const updated = await saveMealToHistory({ name: 'Protein Shake', calories: 160 });

    expect(updated[0].name).toBe('Protein Shake');
    expect(updated[0].count).toBe(2);
    expect(updated[0].calories).toBe(160);
  });

  it('clears meal history when requested', async () => {
    await saveMealToHistory({ name: 'Avocado Toast', calories: 250 });
    await clearMealHistory();
    const history = await getMealHistory();
    expect(history[0].name).toBe('Banana');
  });
});
