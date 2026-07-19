import { describe, expect, it } from 'vitest';

import { buildComplianceIndex } from '@/src/features/activity/compliance';
import type { ActivityListItem, PlannedListItem } from '@/src/features/activity/types';

function act(
  partial: Partial<ActivityListItem> & { id: string; date: string }
): ActivityListItem {
  return {
    id: partial.id,
    title: partial.title ?? 'Ride',
    date: partial.date,
    type: partial.type ?? 'Ride',
    durationSec: partial.durationSec ?? 3600,
    tss: partial.tss ?? 50,
    trainingLoad: null,
    status: { kind: 'ready', label: 'Ready' },
  };
}

function plan(
  partial: Partial<PlannedListItem> & { id: string; date: string }
): PlannedListItem {
  return {
    id: partial.id,
    title: partial.title ?? 'Plan',
    date: partial.date,
    type: partial.type ?? 'Ride',
    durationSec: partial.durationSec ?? 3600,
    tss: partial.tss ?? 50,
  };
}

describe('buildComplianceIndex', () => {
  const now = new Date(2026, 6, 19, 12, 0, 0);

  it('marks done when same day+type and duration within 25%', () => {
    const index = buildComplianceIndex(
      [act({ id: 'a1', date: '2026-07-18T10:00:00', durationSec: 3600 })],
      [plan({ id: 'p1', date: '2026-07-18T08:00:00', durationSec: 3600 })],
      now
    );
    expect(index.forActivity.get('a1')).toBe('done');
    expect(index.forPlanned.get('p1')).toBe('done');
  });

  it('marks modified when duration is far from plan', () => {
    const index = buildComplianceIndex(
      [act({ id: 'a1', date: '2026-07-18T10:00:00', durationSec: 1800 })],
      [plan({ id: 'p1', date: '2026-07-18T08:00:00', durationSec: 5400 })],
      now
    );
    expect(index.forActivity.get('a1')).toBe('modified');
  });

  it('marks past unpaired planned as missed', () => {
    const index = buildComplianceIndex(
      [],
      [plan({ id: 'p1', date: '2026-07-17T08:00:00' })],
      now
    );
    expect(index.forPlanned.get('p1')).toBe('missed');
  });

  it('does not mark future planned as missed', () => {
    const index = buildComplianceIndex(
      [],
      [plan({ id: 'p1', date: '2026-07-20T08:00:00' })],
      now
    );
    expect(index.forPlanned.has('p1')).toBe(false);
  });
});
