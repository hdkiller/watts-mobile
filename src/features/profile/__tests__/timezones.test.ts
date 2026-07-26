import { describe, expect, it } from 'vitest';

import { deviceTimeZone, filterTimeZones, listTimeZones } from '../timezones';

describe('timezones', () => {
  describe('listTimeZones', () => {
    it('returns a non-empty sorted list of timezones', () => {
      const zones = listTimeZones();
      expect(Array.isArray(zones)).toBe(true);
      expect(zones.length).toBeGreaterThan(0);
      expect(zones).toContain('America/New_York');

      // Check sorting
      const sorted = [...zones].sort((a, b) => a.localeCompare(b));
      expect(zones).toEqual(sorted);
    });
  });

  describe('deviceTimeZone', () => {
    it('returns a valid timezone string', () => {
      const tz = deviceTimeZone();
      expect(typeof tz).toBe('string');
      expect(tz.length).toBeGreaterThan(0);
    });
  });

  describe('filterTimeZones', () => {
    const mockZones = ['America/New_York', 'America/Los_Angeles', 'Europe/London', 'UTC'];

    it('returns all zones when query is empty or whitespace', () => {
      expect(filterTimeZones('', mockZones)).toEqual(mockZones);
      expect(filterTimeZones('   ', mockZones)).toEqual(mockZones);
    });

    it('filters zones case-insensitively', () => {
      expect(filterTimeZones('york', mockZones)).toEqual(['America/New_York']);
      expect(filterTimeZones('AMERICA', mockZones)).toEqual([
        'America/New_York',
        'America/Los_Angeles',
      ]);
      expect(filterTimeZones('london', mockZones)).toEqual(['Europe/London']);
    });

    it('returns empty array when no matches', () => {
      expect(filterTimeZones('nonexistent_place', mockZones)).toEqual([]);
    });
  });
});
