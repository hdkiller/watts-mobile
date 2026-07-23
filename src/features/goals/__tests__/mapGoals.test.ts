import { describe, expect, it } from 'vitest';

import {
  goalTypeLabel,
  mapGoalDetail,
  mapGoalGlance,
  pickGoalById,
  pickPrimaryGoal,
  sortGoalsForList,
} from '../mapGoals';
import type { GoalApi } from '../types';

const sample: GoalApi = {
  id: 'g1',
  type: 'PERFORMANCE',
  title: 'Raise FTP',
  targetDate: '2026-09-01T00:00:00.000Z',
  status: 'ACTIVE',
  metric: 'FTP',
  startValue: 250,
  currentValue: 260,
  targetValue: 280,
  priority: 'HIGH',
  description: 'Build toward autumn',
  events: [{ id: 'e1', title: 'Local TT', date: '2026-08-15T00:00:00.000Z' }],
};

describe('mapGoals', () => {
  it('maps glance fields', () => {
    const glance = mapGoalGlance(sample);
    expect(glance.id).toBe('g1');
    expect(glance.title).toBe('Raise FTP');
    expect(glance.typeLabel).toBe('Performance');
    expect(glance.typeShort).toBe('PERF');
    expect(glance.statusLabel).toBe('Active');
    expect(glance.priorityLabel).toBe('High');
    expect(glance.targetDateLabel).toBeTruthy();
  });

  it('maps detail with linked events', () => {
    const detail = mapGoalDetail(sample);
    expect(detail.metric).toBe('FTP');
    expect(detail.targetValue).toBe(280);
    expect(detail.priorityLabel).toBe('High');
    expect(detail.linkedEvents).toEqual([
      expect.objectContaining({ id: 'e1', title: 'Local TT' }),
    ]);
  });

  it('sorts by target date then title', () => {
    const sorted = sortGoalsForList([
      { id: 'b', type: 'EVENT', title: 'B', targetDate: '2026-10-01' },
      { id: 'a', type: 'EVENT', title: 'A', targetDate: '2026-08-01' },
      { id: 'c', type: 'CONSISTENCY', title: 'C' },
    ]);
    expect(sorted.map((g) => g.id)).toEqual(['a', 'b', 'c']);
  });

  it('picks by id', () => {
    expect(pickGoalById([sample], 'g1')?.title).toBe('Raise FTP');
    expect(pickGoalById([sample], 'missing')).toBeNull();
  });

  it('labels unknown types', () => {
    expect(goalTypeLabel('CUSTOM_THING')).toBe('CUSTOM THING');
  });

  it('picks primary by priority desc then oldest createdAt', () => {
    const primary = pickPrimaryGoal([
      {
        id: 'soon',
        type: 'EVENT',
        title: 'Sooner low',
        priority: 'LOW',
        targetDate: '2026-08-01',
        createdAt: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'primary',
        type: 'PERFORMANCE',
        title: 'Primary high',
        priority: 'HIGH',
        targetDate: '2026-12-01',
        createdAt: '2026-02-01T00:00:00.000Z',
      },
      {
        id: 'older-high',
        type: 'CONSISTENCY',
        title: 'Older high',
        priority: 'HIGH',
        targetDate: '2026-11-01',
        createdAt: '2026-01-15T00:00:00.000Z',
      },
    ]);
    expect(primary?.id).toBe('older-high');
  });
});
