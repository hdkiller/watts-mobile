import { describe, expect, it, vi } from 'vitest';

import {
  HEALTHKIT_BACKGROUND_DELIVERY_TYPES,
  HEALTHKIT_SYNC_READ_TYPES,
} from '../syncPermissions';

vi.mock('react-native', () => ({ Platform: { OS: 'ios' } }));

/**
 * The native bridge resolves identifiers with `HKQuantityTypeIdentifier(rawValue:)`
 * and silently *warns and skips* anything it cannot map (Helpers.swift
 * `objectTypesFromArray`). A misspelled identifier therefore drops out of the
 * authorization sheet and makes every query for it throw into a bare catch —
 * the metric simply never arrives, with no error anywhere. `satisfies` on the
 * constants is the compile-time guard; these assert the specific spellings that
 * do not follow the PascalCase pattern of the rest.
 */
describe('HealthKit identifier spellings', () => {
  it('uses Apple’s all-caps SDNN suffix for HRV', () => {
    expect(HEALTHKIT_SYNC_READ_TYPES).toContain('HKQuantityTypeIdentifierHeartRateVariabilitySDNN');
    expect(HEALTHKIT_BACKGROUND_DELIVERY_TYPES).toContain(
      'HKQuantityTypeIdentifierHeartRateVariabilitySDNN'
    );
  });

  it('never carries the camel-cased HRV spelling', () => {
    const all = [...HEALTHKIT_SYNC_READ_TYPES, ...HEALTHKIT_BACKGROUND_DELIVERY_TYPES] as string[];
    expect(all.filter((id) => /VariabilitySdnn$/.test(id))).toEqual([]);
  });

  it('requests every distance modality, not just walking/running', () => {
    for (const identifier of [
      'HKQuantityTypeIdentifierDistanceWalkingRunning',
      'HKQuantityTypeIdentifierDistanceCycling',
      'HKQuantityTypeIdentifierDistanceSwimming',
      'HKQuantityTypeIdentifierDistanceWheelchair',
    ]) {
      expect(HEALTHKIT_SYNC_READ_TYPES).toContain(identifier);
    }
  });

  it('requests workout + route types needed for FIT uploads', () => {
    expect(HEALTHKIT_SYNC_READ_TYPES).toContain('HKWorkoutTypeIdentifier');
    expect(HEALTHKIT_SYNC_READ_TYPES).toContain('HKWorkoutRouteTypeIdentifier');
  });

  it('registers background delivery only for types it also reads', () => {
    const readable = new Set<string>(HEALTHKIT_SYNC_READ_TYPES);
    for (const identifier of HEALTHKIT_BACKGROUND_DELIVERY_TYPES) {
      expect(readable.has(identifier)).toBe(true);
    }
  });
});
