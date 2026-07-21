import { describe, expect, it } from 'vitest';

import {
  mapSampleToWellnessPayload,
  sampleHasMetrics,
  wellnessContentFingerprint,
} from '../mapToWellnessPayload';
import type { DailyWellnessSample } from '../types';

describe('mapToWellnessPayload', () => {
  it('detects empty samples', () => {
    expect(sampleHasMetrics({ date: '2026-07-20', platform: 'healthkit' })).toBe(false);
  });

  it('maps HRV fields by platform semantics and provenance', () => {
    const sample: DailyWellnessSample = {
      date: '2026-07-20',
      platform: 'health_connect',
      sleepSecs: 28800,
      hrv: 55,
      restingHr: 48,
      weight: 74.2,
    };
    const payload = mapSampleToWellnessPayload(sample);
    expect(payload.sleepSecs).toBe(28800);
    expect(payload.hrv).toBe(55);
    expect(payload.restingHr).toBe(48);
    expect(payload.rawJson?.source).toBe('health_connect');
  });

  it('maps steps and rounds them', () => {
    const payload = mapSampleToWellnessPayload({
      date: '2026-07-20',
      platform: 'healthkit',
      steps: 8421.6,
    });
    expect(payload.steps).toBe(8422);
    expect(sampleHasMetrics({ date: '2026-07-20', platform: 'healthkit', steps: 100 })).toBe(true);
  });

  it('maps activity metrics and mirrors them in rawJson.activity', () => {
    const payload = mapSampleToWellnessPayload({
      date: '2026-07-20',
      platform: 'healthkit',
      steps: 1000,
      distanceMeters: 3200.4,
      exerciseMinutes: 42.2,
      floors: 8.6,
    });
    expect(payload.distanceMeters).toBe(3200);
    expect(payload.exerciseMinutes).toBe(42);
    expect(payload.floors).toBe(9);
    expect(payload.rawJson?.activity).toEqual({
      steps: 1000,
      distanceMeters: 3200,
      exerciseMinutes: 42,
      floors: 9,
    });
    expect(
      sampleHasMetrics({
        date: '2026-07-20',
        platform: 'healthkit',
        distanceMeters: 100,
      })
    ).toBe(true);
  });

  it('maps HealthKit SDNN to hrvSdnn', () => {
    const payload = mapSampleToWellnessPayload({
      date: '2026-07-20',
      platform: 'healthkit',
      hrvSdnn: 62,
    });
    expect(payload.hrvSdnn).toBe(62);
    expect(payload.hrv).toBeUndefined();
  });

  it('fingerprints objective metrics stably', () => {
    const a = wellnessContentFingerprint({
      date: '2026-07-20',
      platform: 'healthkit',
      steps: 1000,
      restingHr: 48,
    });
    const b = wellnessContentFingerprint({
      date: '2026-07-20',
      platform: 'healthkit',
      steps: 1000,
      restingHr: 48,
    });
    const c = wellnessContentFingerprint({
      date: '2026-07-20',
      platform: 'healthkit',
      steps: 1001,
      restingHr: 48,
    });
    expect(a).toBe(b);
    expect(a).not.toBe(c);
  });
});
