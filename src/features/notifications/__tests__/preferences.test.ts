import { describe, expect, it } from 'vitest';

import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  normalizeNotificationPreferences,
} from '../preferences';

describe('DEFAULT_NOTIFICATION_PREFERENCES', () => {
  it('matches server defaults including SYNC_COMPLETED off', () => {
    expect(DEFAULT_NOTIFICATION_PREFERENCES).toEqual({
      RECOMMENDATION_READY: true,
      WORKOUT_ANALYSIS_READY: true,
      SYNC_COMPLETED: false,
      COACH_MESSAGE: true,
    });
  });
});

describe('normalizeNotificationPreferences', () => {
  it('fills defaults from empty payload', () => {
    expect(normalizeNotificationPreferences(null)).toEqual(DEFAULT_NOTIFICATION_PREFERENCES);
    expect(normalizeNotificationPreferences({})).toEqual(DEFAULT_NOTIFICATION_PREFERENCES);
  });

  it('honors explicit false toggles from the server', () => {
    expect(
      normalizeNotificationPreferences({
        RECOMMENDATION_READY: false,
        WORKOUT_ANALYSIS_READY: true,
        SYNC_COMPLETED: true,
        COACH_MESSAGE: false,
      })
    ).toEqual({
      RECOMMENDATION_READY: false,
      WORKOUT_ANALYSIS_READY: true,
      SYNC_COMPLETED: false,
      COACH_MESSAGE: false,
    });
  });

  it('always forces SYNC_COMPLETED false (policy-off)', () => {
    expect(normalizeNotificationPreferences({ SYNC_COMPLETED: true }).SYNC_COMPLETED).toBe(false);
  });
});
