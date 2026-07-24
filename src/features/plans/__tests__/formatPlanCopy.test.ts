import { describe, expect, it } from 'vitest';

import { Colors } from '@/src/theme/colors';

import {
  blockTypeAccent,
  formatDayChipLabel,
  formatVolumeHours,
  formatWeekRangeLabel,
  humanizeBlockType,
  humanizeMealStatus,
  humanizePlanStrategy,
  shortBlockLabel,
  upcomingLocalDateKeys,
} from '../formatPlanCopy';

describe('humanizePlanStrategy', () => {
  it('maps known enums', () => {
    expect(humanizePlanStrategy('POLARIZED')).toBe('Polarized');
    expect(humanizePlanStrategy('LINEAR')).toBe('Linear');
  });
});

describe('humanizeBlockType', () => {
  it('maps known block types', () => {
    expect(humanizeBlockType('RACE')).toBe('Race');
    expect(humanizeBlockType('TRANSITION')).toBe('Transition');
  });
});

describe('humanizeMealStatus', () => {
  it('maps meal statuses', () => {
    expect(humanizeMealStatus('PLANNED')).toBe('Planned');
    expect(humanizeMealStatus('DONE')).toBe('Done');
  });
});

describe('formatWeekRangeLabel', () => {
  it('formats same-month ranges', () => {
    expect(formatWeekRangeLabel('2026-07-22', '2026-07-28')).toBe('Jul 22–28');
  });
});

describe('formatDayChipLabel', () => {
  it('returns weekday and day', () => {
    const label = formatDayChipLabel('2026-07-22');
    expect(label).toMatch(/22/);
  });
});

describe('upcomingLocalDateKeys', () => {
  it('returns N dates', () => {
    expect(upcomingLocalDateKeys(3, new Date(2026, 6, 22))).toEqual([
      '2026-07-22',
      '2026-07-23',
      '2026-07-24',
    ]);
  });
});

describe('formatVolumeHours', () => {
  it('formats minutes and hours', () => {
    expect(formatVolumeHours(45)).toBe('45m');
    expect(formatVolumeHours(420)).toBe('7h');
  });
});

describe('blockTypeAccent / shortBlockLabel', () => {
  it('maps race accent and short name via theme tokens', () => {
    expect(blockTypeAccent('RACE')).toBe(Colors.planBlocks.RACE);
    expect(blockTypeAccent('unknown')).toBe(Colors.brand);
    expect(shortBlockLabel('Race Week')).toBe('Race');
  });
});
