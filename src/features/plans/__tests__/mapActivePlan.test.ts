import { describe, expect, it } from 'vitest';

import {
  filterPlannedToWeek,
  mapActivePlanShell,
  selectCurrentWeek,
} from '../mapActivePlan';
import type { ActivePlanApi } from '../types';

const plan: ActivePlanApi = {
  id: 'plan-1',
  name: 'A Race Plan',
  strategy: 'POLARIZED',
  startDate: '2026-07-01',
  targetDate: '2026-09-01',
  currentBlockId: 'b2',
  coachNotes: 'Keep easy days easy.',
  blocks: [
    {
      id: 'b1',
      order: 0,
      name: 'Base',
      type: 'BASE',
      durationWeeks: 4,
      startDate: '2026-07-01',
      weeks: [
        {
          id: 'w1',
          weekNumber: 1,
          startDate: '2026-07-01',
          endDate: '2026-07-07',
          focusLabel: 'Aerobic',
          volumeTargetMinutes: 300,
          tssTarget: 200,
          isRecovery: false,
        },
      ],
    },
    {
      id: 'b2',
      order: 1,
      name: 'Build',
      type: 'BUILD',
      durationWeeks: 3,
      startDate: '2026-07-22',
      weeks: [
        {
          id: 'w2',
          weekNumber: 1,
          startDate: '2026-07-22',
          endDate: '2026-07-28',
          focusLabel: 'Threshold',
          isRecovery: false,
        },
      ],
    },
  ],
};

describe('mapActivePlanShell', () => {
  it('maps title, phase, blocks, and current week for today in range', () => {
    const shell = mapActivePlanShell(plan, { hasUsableData: false });
    expect(shell?.title).toBe('A Race Plan');
    expect(shell?.blocks).toHaveLength(2);
    expect(shell?.weeks).toHaveLength(2);
    expect(shell?.provisionalHint).toBe(true);
    expect(shell?.coachNotes).toContain('easy');
    expect(shell?.currentPhaseLabel).toMatch(/Build/);

    const week = selectCurrentWeek(plan.blocks!, '2026-07-24');
    expect(week?.id).toBe('w2');
    expect(week?.focusLabel).toBe('Threshold');
  });

  it('filters planned workouts to the week range', () => {
    const week = selectCurrentWeek(plan.blocks!, '2026-07-24');
    const filtered = filterPlannedToWeek(
      [
        { id: '1', date: '2026-07-23T00:00:00.000Z', title: 'In' },
        { id: '2', date: '2026-07-30T00:00:00.000Z', title: 'Out' },
      ],
      week
    );
    expect(filtered.map((x) => x.id)).toEqual(['1']);
  });

  it('returns null for missing plan', () => {
    expect(mapActivePlanShell(null)).toBeNull();
  });
});
