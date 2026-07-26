import { describe, expect, it, vi } from 'vitest';
import {
  lookupFoodBarcode,
  searchFoodDatabase,
  type FoodItemResult,
} from '../api';

vi.mock('@/src/api/client', () => ({
  apiFetch: vi.fn(),
}));

import { apiFetch } from '@/src/api/client';

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

  it('calculates portion scaling correctly for custom gram weights', () => {
    const per100g = {
      calories_kcal: 400,
      protein_g: 20,
      carbs_g: 50,
      fat_g: 10,
    };

    const calculatePortion = (grams: number) => {
      const factor = grams / 100;
      return {
        calories: Math.round(per100g.calories_kcal * factor),
        protein: Math.round(per100g.protein_g * factor * 10) / 10,
        carbs: Math.round(per100g.carbs_g * factor * 10) / 10,
        fat: Math.round(per100g.fat_g * factor * 10) / 10,
      };
    };

    // 150g portion (1.5x)
    const portion150 = calculatePortion(150);
    expect(portion150).toEqual({
      calories: 600,
      protein: 30,
      carbs: 75,
      fat: 15,
    });

    // 50g portion (0.5x)
    const portion50 = calculatePortion(50);
    expect(portion50).toEqual({
      calories: 200,
      protein: 10,
      carbs: 25,
      fat: 5,
    });
  });
});
