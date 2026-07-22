import { describe, expect, it } from 'vitest';

import {
  confidenceLabel,
  loggedMealContributions,
  loggedMealTitle,
  saveMealDateLabel,
} from '@/src/features/nutrition/logMealSheetMode';

describe('logMealSheetMode helpers', () => {
  it('maps confidence to factual secondary copy', () => {
    expect(confidenceLabel('HIGH')).toBe('High confidence');
    expect(confidenceLabel('MEDIUM')).toBe('Medium confidence — check portions');
    expect(confidenceLabel('LOW')).toBe('Rough estimate — check portions');
    expect(confidenceLabel(undefined)).toBeNull();
  });

  it('formats logged title with meal name when present', () => {
    expect(loggedMealTitle('  Poke bowl  ')).toBe('Logged · Poke bowl');
    expect(loggedMealTitle('')).toBe('Logged');
    expect(loggedMealTitle('   ')).toBe('Logged');
  });

  it('labels save date as Today / Yesterday / ymd', () => {
    const now = new Date('2026-07-22T12:00:00');
    expect(saveMealDateLabel('2026-07-22', now)).toBe('Today');
    expect(saveMealDateLabel('2026-07-21', now)).toBe('Yesterday');
    expect(saveMealDateLabel('2026-07-20', now)).toBe('2026-07-20');
  });

  it('builds an honest logged-meal contribution summary from positive values only', () => {
    expect(
      loggedMealContributions({
        calories: '642',
        protein: '38.5',
        carbs: '0',
        fat: '',
      })
    ).toEqual([
      { label: 'Energy', value: '+642 kcal' },
      { label: 'Protein', value: '+38.5g' },
    ]);
  });
});
