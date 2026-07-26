import { describe, expect, it } from 'vitest';

import {
  fuelStateExplanation,
  isHorizonLegible,
  mapActiveFuelFeed,
  mapEnergyHorizonPoints,
  mapNutritionStrategy,
} from '../mapNutritionStrategy';

describe('mapNutritionStrategy', () => {
  it('maps fuel matrix, hydration standing, and server advice', () => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    const dateKey = `${y}-${m}-${d}`;

    const standing = mapNutritionStrategy({
      hydrationDebt: 1800.4,
      hydrationStatus: 'red',
      hydrationAdvice: ' High fluid debt detected.',
      showHydrationFlushPrompt: false,
      hydrationFlushPrompt: null,
      summary: 'Your upcoming week features 3 fueled days.',
      fuelingMatrix: [
        {
          date: dateKey,
          state: 2,
          label: 'Steady',
          carbsTarget: 320,
          isRest: false,
        },
      ],
    });

    expect(standing).toMatchObject({
      hydrationDebtMl: 1800,
      hydrationStatus: 'red',
      hydrationAdvice: 'High fluid debt detected.',
      todayFuelState: 2,
      todayFuelLabel: 'Steady',
      todayCarbsTarget: 320,
    });
  });
});

describe('mapEnergyHorizonPoints', () => {
  it('keeps order and downsamples dense series', () => {
    const points = Array.from({ length: 200 }, (_, i) => ({
      timestamp: i * 1000,
      level: i,
    }));
    const mapped = mapEnergyHorizonPoints({ points }, 20);
    expect(mapped).toHaveLength(20);
    expect(mapped[0]?.level).toBe(0);
    expect(mapped[mapped.length - 1]?.level).toBe(199);
  });
});

describe('mapActiveFuelFeed', () => {
  it('prefers meal recommendation over suggested intake', () => {
    const feed = mapActiveFuelFeed({
      mealRecommendation: {
        title: 'Banana + yogurt',
        timing: 'Before your ride',
        reasoningText: 'Easy carbs',
      },
      suggestedIntake: { carbs: 40 },
      recentItems: [{ name: 'Oats', carbs: 45, absorptionProgress: 60, profileLabel: 'Slow' }],
    });
    expect(feed.empty).toBe(false);
    expect(feed.entries[0]?.kind).toBe('recommendation');
    expect(feed.entries.some((e) => e.kind === 'recent')).toBe(true);
  });

  it('returns empty when nothing actionable', () => {
    expect(mapActiveFuelFeed({ success: true }).empty).toBe(true);
  });
});

describe('fuelStateExplanation', () => {
  it('explains Performance and Rest', () => {
    expect(fuelStateExplanation({ state: 3 })?.title).toBe('Performance');
    expect(fuelStateExplanation({ state: 1, isRest: true })?.title).toBe('Rest day');
  });
});

describe('isHorizonLegible', () => {
  it('rejects flat and short series', () => {
    expect(isHorizonLegible([])).toBe(false);
    expect(
      isHorizonLegible([
        { timestampMs: 1, level: 50 },
        { timestampMs: 2, level: 50.1 },
        { timestampMs: 3, level: 50.2 },
        { timestampMs: 4, level: 50.1 },
      ]),
    ).toBe(false);
    expect(
      isHorizonLegible([
        { timestampMs: 1, level: 40 },
        { timestampMs: 2, level: 55 },
        { timestampMs: 3, level: 70 },
        { timestampMs: 4, level: 60 },
      ]),
    ).toBe(true);
  });
});
