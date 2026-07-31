import { describe, expect, it } from 'vitest';

import {
  buildSportSettingsUpsertPayload,
  formFromSportProfile,
  parseSportProfilesFromProfileResponse,
  toSportThresholdPatch,
} from '../mapSports';
import type { SportProfile } from '../types';

const sample: SportProfile = {
  id: 'sp-1',
  name: 'Cycling',
  isDefault: true,
  types: ['Ride', 'VirtualRide'],
  ftp: 250,
  lthr: 165,
  maxHr: 185,
  thresholdPace: null,
  raw: {
    id: 'sp-1',
    name: 'Cycling',
    isDefault: true,
    types: ['Ride', 'VirtualRide'],
    ftp: 250,
    lthr: 165,
    maxHr: 185,
    indoorFtp: 240,
    powerZones: [{ zone: 1 }],
  },
};

describe('parseSportProfilesFromProfileResponse', () => {
  it('parses nested profile.sportSettings', () => {
    const profiles = parseSportProfilesFromProfileResponse({
      connected: true,
      profile: {
        sportSettings: [
          sample.raw,
          {
            id: 'sp-2',
            name: 'Run',
            isDefault: false,
            types: ['Run'],
            ftp: null,
            lthr: 170,
            maxHr: 190,
            thresholdPace: 4.5,
          },
        ],
      },
    });
    expect(profiles).toHaveLength(2);
    expect(profiles[0]?.isDefault).toBe(true);
    expect(profiles[1]?.thresholdPace).toBe(4.5);
  });

  it('drops junk rows', () => {
    const profiles = parseSportProfilesFromProfileResponse({
      profile: { sportSettings: [{ nope: true }, sample.raw] },
    });
    expect(profiles).toHaveLength(1);
  });
});

describe('buildSportSettingsUpsertPayload', () => {
  it('round-trips raw advanced fields while overriding lite thresholds', () => {
    const payload = buildSportSettingsUpsertPayload(sample, {
      ftp: 260,
      lthr: 166,
      maxHr: 186,
    });
    expect(payload).toHaveLength(1);
    expect(payload[0]?.ftp).toBe(260);
    expect(payload[0]?.indoorFtp).toBe(240);
    expect(payload[0]?.powerZones).toEqual([{ zone: 1 }]);
  });
});

describe('toSportThresholdPatch', () => {
  it('builds ints from form values', () => {
    const form = formFromSportProfile(sample);
    form.ftp = '255';
    expect(toSportThresholdPatch(form, false)).toEqual({
      ftp: 255,
      lthr: 165,
      maxHr: 185,
    });
  });

  it('rejects invalid numbers', () => {
    expect(
      toSportThresholdPatch({ ftp: 'x', lthr: '1', maxHr: '2', thresholdPace: '' }, false),
    ).toBeNull();
  });

  it('converts an mm:ss threshold pace to m/s before patching', () => {
    const form = { ftp: '250', lthr: '165', maxHr: '185', thresholdPace: '5:00' };
    const patch = toSportThresholdPatch(form, true);
    // 5:00 min/km == 1000m / 300s
    expect(patch?.thresholdPace).toBeCloseTo(1000 / 300, 5);
  });

  it('rejects a malformed threshold pace', () => {
    const form = { ftp: '250', lthr: '165', maxHr: '185', thresholdPace: 'not-a-pace' };
    expect(toSportThresholdPatch(form, true)).toBeNull();
  });

  it('clears threshold pace when the field is emptied', () => {
    const form = { ftp: '250', lthr: '165', maxHr: '185', thresholdPace: '' };
    expect(toSportThresholdPatch(form, true)?.thresholdPace).toBeNull();
  });
});

describe('formFromSportProfile threshold pace display', () => {
  it('renders the stored m/s value as an mm:ss label', () => {
    const runProfile: SportProfile = {
      ...sample,
      thresholdPace: 1000 / 300, // 5:00 min/km
    };
    expect(formFromSportProfile(runProfile).thresholdPace).toBe('5:00');
  });

  it('round-trips display -> parse back to the original m/s value', () => {
    const mps = 1000 / 315; // 5:15 min/km
    const label = formFromSportProfile({ ...sample, thresholdPace: mps }).thresholdPace;
    const patch = toSportThresholdPatch(
      { ftp: '250', lthr: '165', maxHr: '185', thresholdPace: label },
      true,
    );
    expect(patch?.thresholdPace).toBeCloseTo(mps, 5);
  });
});
