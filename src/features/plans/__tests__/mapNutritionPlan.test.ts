import { describe, expect, it } from 'vitest';

import {
  mapGroceryItems,
  mapNutritionPlanDays,
  mealHasSelection,
  weekHasSelectedMeals,
  weekRangeFromOffset,
} from '../mapNutritionPlan';

describe('mapNutritionPlanDays', () => {
  it('groups selected meals by day with status counts', () => {
    const days = mapNutritionPlanDays({
      id: 'np1',
      meals: [
        {
          id: 'm1',
          date: '2026-07-22',
          windowType: 'PRE_WORKOUT',
          status: 'DONE',
          mealJson: { title: 'Oats' },
        },
        {
          id: 'm2',
          date: '2026-07-22',
          windowType: 'POST_WORKOUT',
          status: 'PLANNED',
          mealJson: { name: 'Shake' },
        },
        {
          id: 'm3',
          date: '2026-07-23',
          windowType: 'DAILY_BASE',
          status: 'SKIPPED',
        },
      ],
    });
    expect(days).toHaveLength(1);
    expect(days[0]?.doneCount).toBe(1);
    expect(days[0]?.plannedCount).toBe(1);
    expect(days[0]?.meals[0]?.title).toBe('Oats');
  });

  it('emits every day in range and ignores empty meal placeholders', () => {
    const days = mapNutritionPlanDays(
      {
        id: 'np1',
        meals: [
          { id: 'empty', date: '2026-07-20', windowType: 'PRE_WORKOUT', status: 'PLANNED' },
          {
            id: 'real',
            date: '2026-07-22',
            windowType: 'DAILY_BASE',
            status: 'PLANNED',
            mealJson: { title: 'Rice bowl' },
          },
        ],
      },
      { start: '2026-07-20', end: '2026-07-26' }
    );
    expect(days).toHaveLength(7);
    expect(days[0]?.meals).toHaveLength(0);
    expect(days[2]?.meals[0]?.title).toBe('Rice bowl');
    expect(weekHasSelectedMeals(days)).toBe(true);
  });

  it('treats missing mealJson as no selection', () => {
    expect(mealHasSelection({ id: 'x', windowType: 'PRE_WORKOUT' })).toBe(false);
    expect(mealHasSelection({ id: 'y', mealJson: { title: 'Oats' } })).toBe(true);
  });
});

describe('mapGroceryItems', () => {
  it('maps ingredient rows and ignores junk', () => {
    const items = mapGroceryItems({
      items: [
        {
          ingredient: 'Rice',
          quantity: 2,
          unit: 'cups',
          category: 'grains',
          sourceMeals: [{ date: '2026-07-22', title: 'Dinner' }],
        },
        { nope: true },
      ],
    });
    expect(items).toHaveLength(1);
    expect(items[0]?.ingredient).toBe('Rice');
    expect(items[0]?.sourceLabels[0]).toContain('Dinner');
  });
});

describe('weekRangeFromOffset', () => {
  it('returns a 7-day Monday-Sunday span', () => {
    const { start, end } = weekRangeFromOffset(0);
    expect(start).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(end).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    const startDate = new Date(`${start}T12:00:00`);
    const endDate = new Date(`${end}T12:00:00`);
    expect(Math.round((endDate.getTime() - startDate.getTime()) / 86400000)).toBe(6);
  });
});
