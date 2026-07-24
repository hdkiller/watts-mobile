import { describe, expect, it } from 'vitest';

import {
  buildAvailabilityDays,
  clampVolumeHours,
  volumePreferenceFromHours,
} from '../planGeneratorHelpers';

describe('volumePreferenceFromHours', () => {
  it('maps web PlanWizard buckets', () => {
    expect(volumePreferenceFromHours(4)).toBe('LOW');
    expect(volumePreferenceFromHours(5)).toBe('LOW');
    expect(volumePreferenceFromHours(6)).toBe('MID');
    expect(volumePreferenceFromHours(9.5)).toBe('MID');
    expect(volumePreferenceFromHours(10)).toBe('HIGH');
  });
});

describe('clampVolumeHours', () => {
  it('clamps to 3–20 in half-hour steps', () => {
    expect(clampVolumeHours(1)).toBe(3);
    expect(clampVolumeHours(25)).toBe(20);
    expect(clampVolumeHours(6.25)).toBe(6.5);
  });
});

describe('buildAvailabilityDays', () => {
  it('emits afternoon slots so days are not rest', () => {
    const days = buildAvailabilityDays([1, 3], ['Ride', 'Gym']);
    expect(days).toHaveLength(2);
    expect(days[0]?.slots?.[0]).toMatchObject({
      startTime: '14:00',
      duration: 90,
      activityTypes: ['Ride', 'Gym'],
      gymAccess: true,
      bikeAccess: true,
    });
    expect(days[0]?.afternoon).toBe(true);
  });
});
