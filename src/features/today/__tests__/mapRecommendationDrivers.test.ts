import { describe, expect, it } from 'vitest';

import {
  formatDriverRowText,
  mapRecommendationDrivers,
} from '../mapRecommendationDrivers';

describe('mapRecommendationDrivers', () => {
  it('maps key factors only', () => {
    const rows = mapRecommendationDrivers({
      keyFactors: ['Planned rest day', 'High weekly load'],
    });
    expect(rows).toEqual([
      { id: 'factor-0', kind: 'factor', label: null, value: 'Planned rest day' },
      { id: 'factor-1', kind: 'factor', label: null, value: 'High weekly load' },
    ]);
  });

  it('maps recovery_analysis only', () => {
    const rows = mapRecommendationDrivers({
      recoveryAnalysis: {
        sleep_quality: 'poor',
        hrv_status: 'green',
        fatigue_level: 'elevated',
        readiness_score: 4,
      },
    });
    expect(rows.map((r) => formatDriverRowText(r))).toEqual([
      'Sleep quality · poor',
      'HRV status · green',
      'Fatigue · elevated',
      'Readiness · 4',
    ]);
  });

  it('merges both and dedupes overlapping factors', () => {
    const rows = mapRecommendationDrivers({
      recoveryAnalysis: {
        sleep_quality: 'poor',
        hrv_status: 'amber',
      },
      keyFactors: ['poor sleep', 'Planned rest day', '  '],
    });
    expect(rows.map((r) => formatDriverRowText(r))).toEqual([
      'Sleep quality · poor',
      'HRV status · amber',
      'Planned rest day',
    ]);
  });

  it('returns empty list when nothing displayable (limited-inputs UI)', () => {
    expect(
      mapRecommendationDrivers({
        recoveryAnalysis: null,
        keyFactors: [],
      })
    ).toEqual([]);
    expect(
      mapRecommendationDrivers({
        recoveryAnalysis: { sleep_quality: '  ', readiness_score: null },
        keyFactors: [''],
      })
    ).toEqual([]);
  });

  it('does not invent sleep/HRV/load metrics from reasoning alone', () => {
    const rows = mapRecommendationDrivers({
      recoveryAnalysis: null,
      keyFactors: null,
    });
    expect(rows).toEqual([]);
    expect(rows.some((r) => /sleep|hrv|load|ctl/i.test(r.value))).toBe(false);
  });

  it('appends optional fuel-state row without macros', () => {
    const rows = mapRecommendationDrivers({
      keyFactors: ['Easy day'],
      fuelStateLabel: 'Steady day',
    });
    expect(rows.at(-1)).toEqual({
      id: 'fuel_state',
      kind: 'fuel',
      label: 'Fueling',
      value: 'Steady day',
    });
  });
});
