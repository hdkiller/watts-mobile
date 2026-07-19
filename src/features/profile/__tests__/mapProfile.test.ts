import { describe, expect, it } from 'vitest';

import {
  emptyAthleteForm,
  formFromAthleteProfile,
  formHasInvalidNumbers,
  isNutritionTrackingEnabled,
  kgToDisplayWeight,
  parseAthleteProfile,
  patchHasFields,
  profileSettingsWebPath,
  toAthleteMetricsPatch,
  weightUnitLabel,
} from '../mapProfile';
import type { AthleteProfile } from '../types';

const sampleProfile: AthleteProfile = {
  name: 'Ada',
  nickname: null,
  email: 'ada@example.com',
  weightKg: 72.2,
  weightUnits: 'Kilograms',
  ftp: 250,
  maxHr: 185,
  lthr: 165,
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

  it('converts kg to display pounds', () => {
    expect(kgToDisplayWeight(72.5748, 'Pounds')).toBe(160);
    expect(kgToDisplayWeight(72.2, 'Kilograms')).toBe(72.2);
    expect(weightUnitLabel('Pounds')).toBe('lbs');
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

  it('exports profile settings web path', () => {
    expect(profileSettingsWebPath()).toBe('/profile/settings');
  });

  it('defaults nutritionTrackingEnabled to true when omitted', () => {
    const profile = parseAthleteProfile({
      profile: { name: 'Ada', weight: 70, weightUnits: 'Kilograms' },
    });
    expect(profile.nutritionTrackingEnabled).toBe(true);
    expect(isNutritionTrackingEnabled(profile)).toBe(true);
    expect(isNutritionTrackingEnabled(undefined)).toBe(true);
  });

  it('respects nutritionTrackingEnabled false', () => {
    const profile = parseAthleteProfile({
      profile: { nutritionTrackingEnabled: false },
    });
    expect(profile.nutritionTrackingEnabled).toBe(false);
    expect(isNutritionTrackingEnabled(profile)).toBe(false);
  });
});
