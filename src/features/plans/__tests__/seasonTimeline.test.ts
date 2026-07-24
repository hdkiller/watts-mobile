import { describe, expect, it } from 'vitest';

import { seasonTodayPercent } from '../mapActivePlan';
import type { PlanBlockShell, PlanWeekShell } from '../types';

const blocks: PlanBlockShell[] = [
  {
    id: 'b1',
    order: 0,
    name: 'Base',
    type: 'BASE',
    primaryFocus: null,
    durationWeeks: 4,
    startDateKey: '2026-07-01',
    recoveryWeekIndex: 4,
  },
  {
    id: 'b2',
    order: 1,
    name: 'Race Week',
    type: 'RACE',
    primaryFocus: 'Race',
    durationWeeks: 1,
    startDateKey: '2026-07-29',
    recoveryWeekIndex: null,
  },
];

const weeks: PlanWeekShell[] = [
  {
    id: 'w1',
    blockId: 'b1',
    weekNumber: 1,
    startDateKey: '2026-07-01',
    endDateKey: '2026-07-07',
    focusLabel: 'Aerobic',
    volumeTargetMinutes: 300,
    tssTarget: 200,
    isRecovery: false,
    explanation: null,
  },
  {
    id: 'w5',
    blockId: 'b2',
    weekNumber: 1,
    startDateKey: '2026-07-29',
    endDateKey: '2026-08-04',
    focusLabel: 'Race',
    volumeTargetMinutes: 420,
    tssTarget: 338,
    isRecovery: false,
    explanation: null,
  },
];

describe('seasonTodayPercent', () => {
  it('places today inside the first block mid-week', () => {
    const pct = seasonTodayPercent(blocks, weeks, '2026-07-03');
    expect(pct).toBeCloseTo((0.5 / 5) * 100, 5);
  });

  it('clamps after the plan ends', () => {
    expect(seasonTodayPercent(blocks, weeks, '2026-09-01')).toBe(100);
  });
});
