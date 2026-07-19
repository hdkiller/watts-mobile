import { describe, expect, it } from 'vitest';

import {
  applyTimePreset,
  clampDescription,
  filterActiveToday,
  formFromRecoveryItem,
  parseRecoveryContextList,
  toJourneyPayload,
} from '../mapRecovery';
import { optionById, severityValueFromPreset } from '../taxonomy';
import type { RecoveryContextItem } from '../types';

describe('taxonomy map', () => {
  it('maps illness to FATIGUE + WELLNESS_CHECK', () => {
    const option = optionById('illness');
    expect(option.category).toBe('FATIGUE');
    expect(option.eventType).toBe('WELLNESS_CHECK');
  });

  it('maps general note to RECOVERY_NOTE', () => {
    const option = optionById('note');
    expect(option.eventType).toBe('RECOVERY_NOTE');
  });

  it('uses web severity presets', () => {
    expect(severityValueFromPreset('mild')).toBe(3);
    expect(severityValueFromPreset('moderate')).toBe(6);
    expect(severityValueFromPreset('severe')).toBe(9);
  });
});

describe('toJourneyPayload', () => {
  it('builds ISO payload from form values', () => {
    const payload = toJourneyPayload({
      optionId: 'illness',
      severityPreset: 'moderate',
      timePreset: 'custom',
      localTimestamp: '2026-07-19T08:30',
      description: '  fever overnight  ',
    });

    expect(payload.category).toBe('FATIGUE');
    expect(payload.eventType).toBe('WELLNESS_CHECK');
    expect(payload.severity).toBe(6);
    expect(payload.description).toBe('fever overnight');
    expect(payload.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('omits empty description', () => {
    const payload = toJourneyPayload({
      optionId: 'fatigue',
      severityPreset: 'mild',
      timePreset: 'now',
      localTimestamp: applyTimePreset('now'),
      description: '   ',
    });
    expect(payload.description).toBeUndefined();
  });
});

describe('clampDescription', () => {
  it('trims and caps at 500', () => {
    const long = `${'a'.repeat(510)}`;
    expect(clampDescription(long).length).toBe(500);
  });
});

describe('filterActiveToday', () => {
  const base: RecoveryContextItem = {
    id: '1',
    sourceRecordId: 'src-1',
    kind: 'journey_event',
    sourceType: 'manual_event',
    label: 'Fatigue',
    description: null,
    severity: 6,
    startAt: '2026-07-19T08:00:00.000Z',
    endAt: '2026-07-19T23:59:59.000Z',
    editable: true,
    deletable: true,
    origin: 'Manual',
    category: 'FATIGUE',
  };

  it('includes items spanning today', () => {
    expect(filterActiveToday([base], '2026-07-19')).toHaveLength(1);
  });

  it('excludes items outside today', () => {
    expect(filterActiveToday([base], '2026-07-20')).toHaveLength(0);
  });
});

describe('parseRecoveryContextList', () => {
  it('parses valid rows and drops junk', () => {
    const items = parseRecoveryContextList([
      {
        id: 'a',
        sourceRecordId: 's',
        kind: 'journey_event',
        sourceType: 'manual_event',
        label: 'Illness',
        description: null,
        severity: 3,
        startAt: '2026-07-19T00:00:00.000Z',
        endAt: '2026-07-19T23:59:59.000Z',
        editable: true,
        deletable: true,
        origin: 'Manual',
        category: 'FATIGUE',
        metadata: { eventType: 'WELLNESS_CHECK' },
      },
      { nope: true },
    ]);
    expect(items).toHaveLength(1);
    expect(formFromRecoveryItem(items[0]!).optionId).toBe('illness');
  });
});
