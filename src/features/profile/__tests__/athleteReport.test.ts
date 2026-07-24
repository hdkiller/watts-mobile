import { describe, expect, it } from 'vitest';

import { badgeToneForStatus, mapAthleteProfileReport } from '../mapAthleteReport';
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

  it('keeps fitness status on a short styled badge and out of body', () => {
    const report = mapAthleteProfileReport({
      id: 'r2',
      status: 'COMPLETED',
      analysisJson: {
        current_fitness: {
          status: 'developing',
          status_label: 'Jelenlegi állóképesség: Fejlesztés alatt',
          key_points: ['CTL is low after 30 days off.'],
        },
      },
    });

    const fitness = report?.sections.find((s) => s.kind === 'fitness');
    expect(fitness?.badge).toEqual({
      label: 'Developing',
      tone: 'recovery',
    });
    expect(report?.fitnessStatusBadge).toEqual({
      label: 'Developing',
      tone: 'recovery',
    });
    expect(report?.fitnessStatusLabel).toBe('Jelenlegi állóképesség: Fejlesztés alatt');
    expect(fitness?.body).toBe('');
    expect(fitness?.bullets).toEqual(['CTL is low after 30 days off.']);
  });

  it('styles declining trend as modify tone', () => {
    const report = mapAthleteProfileReport({
      id: 'r2b',
      status: 'COMPLETED',
      analysisJson: {
        recent_performance: {
          trend: 'declining',
          patterns: ['Volume dropped'],
        },
      },
    });

    const recent = report?.sections.find((s) => s.kind === 'recent');
    expect(recent?.badge).toEqual({ label: 'Declining', tone: 'modify' });
  });

  it('splits training strengths and areas_for_development', () => {
    const report = mapAthleteProfileReport({
      id: 'r3',
      status: 'COMPLETED',
      analysisJson: {
        training_characteristics: {
          training_style: 'Cautious rebuild.',
          strengths: ['Mentally fresh'],
          areas_for_development: ['Rebuild aerobic base'],
          areas_for_improvement: ['Rebuild aerobic base'],
        },
      },
    });

    const training = report?.sections.find((s) => s.kind === 'training');
    expect(training?.body).toBe('Cautious rebuild.');
    expect(training?.strengths).toEqual(['Mentally fresh']);
    expect(training?.development).toEqual(['Rebuild aerobic base']);
    expect(training?.bullets).toEqual([]);
  });

  it('maps recovery and nutrition into labeled fields', () => {
    const report = mapAthleteProfileReport({
      id: 'r4',
      status: 'COMPLETED',
      analysisJson: {
        recovery_profile: {
          recovery_pattern: 'Steady',
          hrv_trend: 'Rising',
          sleep_quality: 'Solid',
          key_observations: ['Sleep debt cleared'],
        },
        nutrition_profile: {
          nutrition_pattern: 'Consistent',
          caloric_balance: 'Slight deficit',
          macro_distribution: 'Carb-forward',
          key_observations: ['Fuel hard days'],
        },
      },
    });

    const recovery = report?.sections.find((s) => s.kind === 'recovery');
    expect(recovery?.fields).toEqual([
      { label: 'Recovery pattern', value: 'Steady' },
      { label: 'HRV trend', value: 'Rising' },
      { label: 'Sleep quality', value: 'Solid' },
    ]);
    expect(recovery?.bullets).toEqual(['Sleep debt cleared']);

    const nutrition = report?.sections.find((s) => s.kind === 'nutrition');
    expect(nutrition?.fields).toEqual([
      { label: 'Nutrition pattern', value: 'Consistent' },
      { label: 'Caloric balance', value: 'Slight deficit' },
      { label: 'Macro distribution', value: 'Carb-forward' },
    ]);
    expect(nutrition?.bullets).toEqual(['Fuel hard days']);
  });

  it('returns null for invalid payload', () => {
    expect(mapAthleteProfileReport({})).toBeNull();
  });
});

describe('badgeToneForStatus', () => {
  it('maps web status/trend enums to companion tones', () => {
    expect(badgeToneForStatus('excellent')).toBe('success');
    expect(badgeToneForStatus('developing')).toBe('recovery');
    expect(badgeToneForStatus('recovering')).toBe('modify');
    expect(badgeToneForStatus('declining')).toBe('modify');
    expect(badgeToneForStatus('variable')).toBe('muted');
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
