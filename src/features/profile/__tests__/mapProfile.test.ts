import { describe, expect, it } from 'vitest';

import {
  aiPersonaOptions,
  dangerZoneWebPath,
  emptyAthleteForm,
  formFromAthleteProfile,
  formHasInvalidNumbers,
  isNutritionTrackingEnabled,
  kgToDisplayWeight,
  normalizeAiPersona,
  normalizeDistanceUnits,
  normalizeTemperatureUnits,
  parseAiSettingsLite,
  parseAthleteProfile,
  patchHasFields,
  profileSettingsWebPath,
  toAthleteMetricsPatch,
  weightUnit,
  weightUnitLabel,
} from '../mapProfile';
import { deviceTimeZone, filterTimeZones } from '../timezones';
import type { AthleteProfile } from '../types';

const sampleProfile: AthleteProfile = {
  name: 'Ada',
  nickname: null,
  email: 'ada@example.com',
  country: null,
  dob: null,
  weightKg: 72.2,
  weightUnits: 'Kilograms',
  distanceUnits: 'Kilometers',
  temperatureUnits: 'Celsius',
  timezone: null,
  aiContext: null,
  ftp: 250,
  maxHr: 185,
  lthr: 165,
  restingHr: null,
  nutritionTrackingEnabled: true,
};

describe('mapProfile', () => {
  it('parses GET /api/profile envelope', () => {
    const profile = parseAthleteProfile({
      connected: true,
      profile: {
        name: 'Ada',
        email: 'ada@example.com',
        weight: 72.2,
        weightUnits: 'Kilograms',
        ftp: 250,
        maxHr: 185,
        lthr: 165,
      },
    });

    expect(profile).toEqual(sampleProfile);
  });

  it('parses units, timezone, and aiContext', () => {
    const profile = parseAthleteProfile({
      profile: {
        weight: 70,
        weightUnits: 'Pounds',
        distanceUnits: 'Miles',
        temperatureUnits: 'Fahrenheit',
        timezone: 'Europe/Berlin',
        aiContext: 'Prefer indoor rides',
        nickname: 'Ada',
      },
    });

    expect(profile.distanceUnits).toBe('Miles');
    expect(profile.temperatureUnits).toBe('Fahrenheit');
    expect(profile.timezone).toBe('Europe/Berlin');
    expect(profile.aiContext).toBe('Prefer indoor rides');
    expect(profile.nickname).toBe('Ada');
  });

  it('parses PATCH success envelope', () => {
    const profile = parseAthleteProfile({
      success: true,
      profile: {
        weight: 70,
        weightUnits: 'Pounds',
        ftp: 240,
        maxHr: null,
        lthr: null,
      },
    });

    expect(profile.weightKg).toBe(70);
    expect(profile.weightUnits).toBe('Pounds');
    expect(profile.ftp).toBe(240);
    expect(profile.maxHr).toBeNull();
  });

  it('normalizes unit and persona enums', () => {
    expect(normalizeDistanceUnits('Miles')).toBe('Miles');
    expect(normalizeDistanceUnits('nope')).toBe('Kilometers');
    expect(normalizeTemperatureUnits('Fahrenheit')).toBe('Fahrenheit');
    expect(normalizeAiPersona('Drill Sergeant')).toBe('Drill Sergeant');
    expect(normalizeAiPersona('unknown')).toBe('Supportive');
    expect(aiPersonaOptions()).toHaveLength(4);
  });

  it('parses AI settings lite', () => {
    expect(
      parseAiSettingsLite({
        aiPersona: 'Motivational',
        aiRequireToolApproval: true,
        nickname: 'Ada',
        aiContext: 'Z2 focus',
      })
    ).toEqual({
      aiPersona: 'Motivational',
      aiRequireToolApproval: true,
      nickname: 'Ada',
      aiContext: 'Z2 focus',
    });
  });

  it('converts kg to display pounds', () => {
    expect(kgToDisplayWeight(72.5748, 'Pounds')).toBe(160);
    expect(kgToDisplayWeight(72.2, 'Kilograms')).toBe(72.2);
    expect(weightUnitLabel('Pounds')).toBe('lbs');
  });

  it('exposes weightUnit with kg fallback', () => {
    expect(weightUnit(undefined)).toBe('kg');
    expect(weightUnit(null)).toBe('kg');
    expect(weightUnit(sampleProfile)).toBe('kg');
    expect(weightUnit({ ...sampleProfile, weightUnits: 'Pounds' })).toBe('lbs');
  });

  it('prefills form from profile using display units', () => {
    expect(formFromAthleteProfile(sampleProfile)).toEqual({
      weight: '72.2',
      ftp: '250',
      maxHr: '185',
      lthr: '165',
    });

    expect(
      formFromAthleteProfile({
        ...sampleProfile,
        weightKg: 72.5748,
        weightUnits: 'Pounds',
      }).weight
    ).toBe('160');
  });

  it('builds PATCH with weightUnits for server conversion', () => {
    expect(
      toAthleteMetricsPatch(
        {
          weight: '160',
          ftp: '255.4',
          maxHr: '',
          lthr: '170',
        },
        'Pounds'
      )
    ).toEqual({
      weight: 160,
      weightUnits: 'Pounds',
      ftp: 255,
      lthr: 170,
    });
  });

  it('detects invalid numbers and empty patches', () => {
    expect(formHasInvalidNumbers({ ...emptyAthleteForm(), ftp: 'x' })).toBe(true);
    expect(formHasInvalidNumbers(emptyAthleteForm())).toBe(false);
    expect(patchHasFields({})).toBe(false);
    expect(patchHasFields({ ftp: 250 })).toBe(true);
  });

  it('exports profile settings and danger zone web paths', () => {
    expect(profileSettingsWebPath()).toBe('/profile/settings');
    expect(dangerZoneWebPath()).toBe('/settings/danger');
  });

  it('defaults nutritionTrackingEnabled to true when omitted', () => {
    const profile = parseAthleteProfile({
      profile: { name: 'Ada', weight: 70, weightUnits: 'Kilograms' },
    });
    expect(profile.nutritionTrackingEnabled).toBe(true);
    expect(isNutritionTrackingEnabled(profile)).toBe(true);
  });

  it('filters timezones by query', () => {
    expect(filterTimeZones('berlin', ['Europe/Berlin', 'America/New_York'])).toEqual([
      'Europe/Berlin',
    ]);
    expect(typeof deviceTimeZone()).toBe('string');
  });
});
