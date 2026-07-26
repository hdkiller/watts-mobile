import { describe, expect, it } from 'vitest';

import {
  findOptionForCategoryType,
  JOURNEY_EVENT_OPTIONS,
  optionById,
  SEVERITY_PRESETS,
  severityPresetFromValue,
  severityValueFromPreset,
} from '../taxonomy';

describe('recovery taxonomy', () => {
  describe('optionById', () => {
    it('returns option by ID when found', () => {
      const option = optionById('injury');
      expect(option.id).toBe('injury');
      expect(option.title).toContain('Injury');
    });

    it('returns default fallback (illness) when ID is unknown', () => {
      // @ts-expect-error testing invalid id
      const option = optionById('unknown_id');
      expect(option.id).toBe('illness');
    });
  });

  describe('findOptionForCategoryType', () => {
    it('matches exact category and eventType', () => {
      const match = findOptionForCategoryType('MUSCLE_PAIN', 'SYMPTOM');
      expect(match.id).toBe('injury');
    });

    it('falls back to category match when eventType differs', () => {
      const match = findOptionForCategoryType('SLEEP', 'SYMPTOM');
      expect(match.id).toBe('sleep');
    });

    it('falls back to default (illness) when neither match', () => {
      const match = findOptionForCategoryType('UNKNOWN_CAT', 'UNKNOWN_TYPE');
      expect(match.id).toBe('illness');
    });
  });

  describe('severity preset conversions', () => {
    it('maps numerical severity values to preset IDs', () => {
      expect(severityPresetFromValue(1)).toBe('mild');
      expect(severityPresetFromValue(4)).toBe('mild');
      expect(severityPresetFromValue(5)).toBe('moderate');
      expect(severityPresetFromValue(6)).toBe('moderate');
      expect(severityPresetFromValue(7)).toBe('moderate');
      expect(severityPresetFromValue(8)).toBe('severe');
      expect(severityPresetFromValue(10)).toBe('severe');
      expect(severityPresetFromValue(undefined)).toBe('moderate');
    });

    it('maps preset IDs to numerical severity values', () => {
      expect(severityValueFromPreset('mild')).toBe(3);
      expect(severityValueFromPreset('moderate')).toBe(6);
      expect(severityValueFromPreset('severe')).toBe(9);
    });
  });

  describe('constants integrity', () => {
    it('contains non-empty journey options and severity presets', () => {
      expect(JOURNEY_EVENT_OPTIONS.length).toBeGreaterThan(5);
      expect(SEVERITY_PRESETS).toHaveLength(3);
    });
  });
});
