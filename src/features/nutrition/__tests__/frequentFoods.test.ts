import { describe, expect, it } from 'vitest';

import { COMMON_FREQUENT_FOODS } from '../frequentFoods';

describe('frequentFoods', () => {
  it('contains common preset food items with valid macronutrient metrics', () => {
    expect(COMMON_FREQUENT_FOODS.length).toBeGreaterThan(0);
    for (const food of COMMON_FREQUENT_FOODS) {
      expect(food).toHaveProperty('id');
      expect(food).toHaveProperty('name');
      expect(food).toHaveProperty('emoji');
      expect(food.calories).toBeGreaterThan(0);
      expect(food.protein).toBeGreaterThanOrEqual(0);
      expect(food.carbs).toBeGreaterThanOrEqual(0);
      expect(food.fat).toBeGreaterThanOrEqual(0);
    }
  });
});
