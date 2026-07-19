import { describe, expect, it } from 'vitest';

import {
  emptyQuickLogForm,
  formatMacroGrams,
  localDateYmd,
  nutritionWebPath,
  pickTodayNutrition,
  quickLogHasContent,
  toNutritionUploadPayload,
} from '../mapNutrition';

describe('pickTodayNutrition', () => {
  it('maps today’s macros and water from list payload', () => {
    const today = '2026-07-19';
    const result = pickTodayNutrition(
      {
        success: true,
        nutrition: [
          {
            id: 'n1',
            date: today,
            calories: 1840,
            protein: 120.5,
            carbs: 200,
            fat: 55,
            waterMl: 1500,
          },
          { id: 'n0', date: '2026-07-18', calories: 900 },
        ],
      },
      today
    );

    expect(result.id).toBe('n1');
    expect(result.calories).toBe(1840);
    expect(result.protein).toBe(120.5);
    expect(result.waterMl).toBe(1500);
    expect(result.isEmpty).toBe(false);
  });

  it('returns empty day when no row for today', () => {
    const today = '2026-07-19';
    const result = pickTodayNutrition(
      { nutrition: [{ id: 'n0', date: '2026-07-18', calories: 900 }] },
      today
    );
    expect(result.isEmpty).toBe(true);
    expect(result.date).toBe(today);
    expect(result.calories).toBe(0);
  });
});

describe('toNutritionUploadPayload', () => {
  it('builds POST item with meal and macros', () => {
    const loggedAt = new Date('2026-07-19T08:30:00.000Z');
    const payload = toNutritionUploadPayload(
      {
        meal: 'BREAKFAST',
        name: '  Oats  ',
        calories: '320',
        protein: '18',
        carbs: '45.5',
        fat: '8',
      },
      '2026-07-19',
      loggedAt
    );

    expect(payload.date).toBe('2026-07-19');
    expect(payload.items).toHaveLength(1);
    expect(payload.items[0]).toMatchObject({
      name: 'Oats',
      meal: 'BREAKFAST',
      calories: 320,
      protein: 18,
      carbs: 45.5,
      fat: 8,
      logged_at: '2026-07-19T08:30:00.000Z',
    });
  });

  it('requires content via quickLogHasContent', () => {
    expect(quickLogHasContent(emptyQuickLogForm())).toBe(false);
    expect(quickLogHasContent({ ...emptyQuickLogForm(), calories: '100' })).toBe(true);
  });
});

describe('helpers', () => {
  it('formats macros and web path', () => {
    expect(formatMacroGrams(12)).toBe('12');
    expect(formatMacroGrams(12.5)).toBe('12.5');
    expect(nutritionWebPath()).toBe('/nutrition');
    expect(localDateYmd(new Date('2026-07-19T15:00:00'))).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
