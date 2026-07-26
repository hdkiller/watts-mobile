import { apiFetch } from '@/src/api/client';
import { describe, expect, it, vi } from 'vitest';
import {
  lookupFoodBarcode,
  searchFoodDatabase,
  type FoodItemResult,
} from '../api';
import {
  defaultPortionGrams,
  foodItemKey,
  parseGrams,
  portionPresets,
  scalePortion,
} from '../portionMath';

vi.mock('@/src/api/client', () => ({
  apiFetch: vi.fn(),
}));

const mockApiFetch = vi.mocked(apiFetch);

describe('Food Database API Client', () => {
  it('searchFoodDatabase handles array response', async () => {
    const mockItems: FoodItemResult[] = [
      {
        name: 'Oatmeal',
        brand: 'Quaker',
        nutrients_per_100g: {
          calories_kcal: 389,
          protein_g: 16.9,
          carbs_g: 66.3,
          fat_g: 6.9,
        },
      },
    ];

    mockApiFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockItems,
    } as Response);

    const result = await searchFoodDatabase('Oatmeal');
    expect(mockApiFetch).toHaveBeenCalledWith('/api/nutrition/search?q=Oatmeal&limit=20');
    expect(result).toEqual(mockItems);
  });

  it('searchFoodDatabase handles wrapped { items: [...] } response', async () => {
    const mockItems: FoodItemResult[] = [
      {
        name: 'Banana',
        nutrients_per_100g: {
          calories_kcal: 89,
          protein_g: 1.1,
          carbs_g: 22.8,
          fat_g: 0.3,
        },
      },
    ];

    mockApiFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ items: mockItems }),
    } as Response);

    const result = await searchFoodDatabase('Banana');
    expect(result).toEqual(mockItems);
  });

  it('lookupFoodBarcode parses found barcode and returns null on 404', async () => {
    const mockItem: FoodItemResult = {
      name: 'Greek Yogurt',
      brand: 'Chobani',
      barcode: '07394820',
      nutrients_per_100g: {
        calories_kcal: 59,
        protein_g: 10,
        carbs_g: 3.6,
        fat_g: 0.4,
      },
    };

    mockApiFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ item: mockItem }),
    } as Response);

    const found = await lookupFoodBarcode('07394820');
    expect(found).toEqual(mockItem);

    mockApiFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({ message: 'Not found' }),
    } as Response);

    const notFound = await lookupFoodBarcode('99999999');
    expect(notFound).toBeNull();
  });

});

describe('portionMath', () => {
  const per100g = { calories_kcal: 400, protein_g: 20, carbs_g: 50, fat_g: 10 };

  it('scales nutrients by gram weight', () => {
    expect(scalePortion(per100g, 150)).toEqual({
      calories: 600,
      protein: 30,
      carbs: 75,
      fat: 15,
      fiber: 0,
    });
    expect(scalePortion(per100g, 50)).toEqual({
      calories: 200,
      protein: 10,
      carbs: 25,
      fat: 5,
      fiber: 0,
    });
  });

  it('rounds calories to whole kcal and macros to 0.1 g', () => {
    const odd = { calories_kcal: 389, protein_g: 16.9, carbs_g: 66.3, fat_g: 6.9 };
    expect(scalePortion(odd, 37)).toEqual({
      calories: 144,
      protein: 6.3,
      carbs: 24.5,
      fat: 2.6,
      fiber: 0,
    });
  });

  it('scales optional fiber only when present', () => {
    expect(scalePortion({ ...per100g, fiber_g: 5 }, 200).fiber).toBe(10);
    expect(scalePortion(per100g, 200).fiber).toBe(0);
  });

  it('returns a zeroed portion for missing nutrients or non-positive grams', () => {
    const zero = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
    expect(scalePortion(per100g, 0)).toEqual(zero);
    expect(scalePortion(per100g, -10)).toEqual(zero);
    expect(scalePortion(per100g, NaN)).toEqual(zero);
    expect(scalePortion(undefined, 100)).toEqual(zero);
  });

  it('parseGrams rejects blank and non-positive input', () => {
    expect(parseGrams('250')).toBe(250);
    expect(parseGrams('12.5')).toBe(12.5);
    expect(parseGrams('')).toBe(0);
    expect(parseGrams('abc')).toBe(0);
    expect(parseGrams('-5')).toBe(0);
    expect(parseGrams('0')).toBe(0);
  });

  it('defaults the portion to the serving size, falling back to 100 g', () => {
    expect(defaultPortionGrams({ serving_size_g: 30 })).toBe(30);
    expect(defaultPortionGrams({ serving_size_g: 0 })).toBe(100);
    expect(defaultPortionGrams({})).toBe(100);
    expect(defaultPortionGrams(null)).toBe(100);
  });

  it('appends the serving size as a preset without duplicating a standard one', () => {
    expect(portionPresets({ serving_size_g: 30 })).toEqual([50, 100, 150, 200, 30]);
    // A 100 g serving must not produce a second chip with the same React key.
    expect(portionPresets({ serving_size_g: 100 })).toEqual([50, 100, 150, 200]);
    expect(portionPresets(null)).toEqual([50, 100, 150, 200]);
  });

  it('keys items by barcode, falling back to brand + name', () => {
    const base: FoodItemResult = { name: 'Oats', nutrients_per_100g: per100g };
    expect(foodItemKey({ ...base, barcode: '123' })).toBe('123');
    expect(foodItemKey({ ...base, brand: 'Quaker' })).toBe('Quaker|Oats');
    expect(foodItemKey(base)).toBe('|Oats');
    expect(foodItemKey(null)).toBeNull();
    // Different foods must not share a key, or portion state leaks between them.
    expect(foodItemKey({ ...base, brand: 'A' })).not.toBe(foodItemKey({ ...base, brand: 'B' }));
  });
});
