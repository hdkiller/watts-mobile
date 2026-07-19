import { describe, expect, it } from 'vitest';

import { mapAthleteProfileReport } from '../mapAthleteReport';
import { ageFromDob, countryFlag } from '../mapProfile';

describe('mapAthleteProfileReport', () => {
  it('maps executive summary and scores', () => {
    const report = mapAthleteProfileReport({
      id: 'r1',
      status: 'COMPLETED',
      createdAt: '2026-07-18T00:00:00.000Z',
      analysisJson: {
        executive_summary: 'Strong aerobic base.',
        recommendations_summary: 'Keep building volume.',
        current_fitness: { status_label: 'Building' },
        athlete_scores: {
          current_fitness: { score: 7 },
          recovery_capacity: { score: 8 },
        },
      },
    });

    expect(report?.executiveSummary).toBe('Strong aerobic base.');
    expect(report?.fitnessStatusLabel).toBe('Building');
    expect(report?.scores).toEqual([
      { key: 'current_fitness', label: 'Fitness', score: 7 },
      { key: 'recovery_capacity', label: 'Recovery', score: 8 },
    ]);
  });

  it('returns null for invalid payload', () => {
    expect(mapAthleteProfileReport({})).toBeNull();
  });
});

describe('countryFlag / ageFromDob', () => {
  it('builds flag from ISO country code', () => {
    expect(countryFlag('hu')).toBe('🇭🇺');
    expect(countryFlag('USA')).toBeNull();
  });

  it('computes age from dob', () => {
    expect(ageFromDob('1990-01-01')).toBeGreaterThan(30);
    expect(ageFromDob(null)).toBeNull();
  });
});
