import { describe, expect, it } from 'vitest';

import {
  canonicalSportFromHealthConnect,
  canonicalSportFromHealthKit,
  fitSportCode,
  sportLabel,
} from '../sportTypes';

describe('sportTypes', () => {
  it('maps HealthKit numeric activity types to canonical sports', () => {
    expect(canonicalSportFromHealthKit(37)).toBe('running');
    expect(canonicalSportFromHealthKit(13)).toBe('cycling');
    expect(canonicalSportFromHealthKit(46)).toBe('swimming');
    expect(canonicalSportFromHealthKit(52)).toBe('walking');
    expect(canonicalSportFromHealthKit(57)).toBe('yoga');
    expect(canonicalSportFromHealthKit(9999)).toBeUndefined();
    expect(canonicalSportFromHealthKit(undefined)).toBeUndefined();
  });

  it('maps Health Connect exercise types to canonical sports', () => {
    expect(canonicalSportFromHealthConnect(56)).toBe('running');
    expect(canonicalSportFromHealthConnect(57)).toBe('running');
    expect(canonicalSportFromHealthConnect(8)).toBe('cycling');
    expect(canonicalSportFromHealthConnect(74)).toBe('swimming');
    expect(canonicalSportFromHealthConnect(79)).toBe('walking');
    expect(canonicalSportFromHealthConnect(9999)).toBeUndefined();
  });

  it('maps canonical sports to FIT codes', () => {
    expect(fitSportCode('running')).toBe(1);
    expect(fitSportCode('cycling')).toBe(2);
    expect(fitSportCode('swimming')).toBe(5);
    expect(fitSportCode('walking')).toBe(11);
    expect(fitSportCode('strength')).toBe(10);
    expect(fitSportCode(undefined)).toBe(0);
  });

  it('falls back to keyword matching for non-canonical strings', () => {
    expect(fitSportCode('Outdoor Run')).toBe(1);
    expect(fitSportCode('Mountain Biking')).toBe(2);
    expect(fitSportCode('37')).toBe(0); // raw codes stay generic
  });

  it('labels canonical sports and rejects raw codes', () => {
    expect(sportLabel('running')).toBe('Running');
    expect(sportLabel('hiit')).toBe('HIIT');
    expect(sportLabel('37')).toBeUndefined();
    expect(sportLabel(undefined)).toBeUndefined();
  });
});
