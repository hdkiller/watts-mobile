import { describe, expect, it } from 'vitest';

import type { ActivityListItem, PlannedListItem } from '@/src/features/activity/types';
import { computeWeekGlance, localDateKey, weekRangeContaining } from '@/src/features/today/weekGlance';

function activity(
  partial: Partial<ActivityListItem> & { date: string; durationSec?: number; tss?: number }
): ActivityListItem {
  return {
    id: partial.id ?? 'a1',
    title: partial.title ?? 'Ride',
    date: partial.date,
    type: partial.type ?? 'Ride',
    durationSec: partial.durationSec ?? 3600,
    tss: partial.tss ?? 50,
    trainingLoad: null,
    status: { kind: 'ready', label: 'Ready' },
  };
}

function planned(
  partial: Partial<PlannedListItem> & { date: string; tss?: number }
): PlannedListItem {
  return {
    id: partial.id ?? 'p1',
    title: partial.title ?? 'Plan',
    date: partial.date,
    type: partial.type ?? 'Ride',
    durationSec: partial.durationSec ?? 3600,
    tss: partial.tss ?? 80,
  };
}

describe('weekGlance', () => {
  it('builds a Monday-start local week', () => {
    // Wednesday 2026-07-15 local
    const { keys } = weekRangeContaining(new Date(2026, 6, 15, 12, 0, 0));
    expect(keys[0]).toBe('2026-07-13');
    expect(keys[6]).toBe('2026-07-19');
  });

  it('sums done duration/TSS and planned TSS in the current week', () => {
    const now = new Date(2026, 6, 15, 12, 0, 0);
    const glance = computeWeekGlance(
      [
        activity({ date: '2026-07-14T10:00:00', durationSec: 7200, tss: 100 }),
        activity({ date: '2026-07-01T10:00:00', durationSec: 3600, tss: 40 }), // outside week
      ],
      [planned({ date: '2026-07-16T10:00:00', tss: 90 }), planned({ date: '2026-07-17T10:00:00', tss: 70 })],
      now
    );

    expect(glance.doneDurationLabel).toBe('2h');
    expect(Math.round(glance.doneTss)).toBe(100);
    expect(Math.round(glance.plannedTss)).toBe(160);
    expect(glance.summaryLine).toContain('100 TSS of ~160 planned');
    expect(glance.days).toHaveLength(7);
    expect(glance.days.find((d) => d.dateKey === '2026-07-14')?.hasDone).toBe(true);
    expect(glance.days.find((d) => d.dateKey === '2026-07-16')?.hasPlanned).toBe(true);
  });

  it('localDateKey uses local calendar day', () => {
    expect(localDateKey(new Date(2026, 6, 19, 23, 30, 0))).toBe('2026-07-19');
  });

  it('treats date-only strings as local calendar days (not UTC midnight)', () => {
    expect(localDateKey('2026-07-20')).toBe('2026-07-20');
  });

  it('keeps planned-day bars visible when done days use duration/TSS', () => {
    const now = new Date(2026, 6, 15, 12, 0, 0);
    const glance = computeWeekGlance(
      [activity({ date: '2026-07-14T10:00:00', durationSec: 3600, tss: 80 })],
      [planned({ date: '2026-07-16T10:00:00', tss: 70 })],
      now
    );
    const done = glance.days.find((d) => d.dateKey === '2026-07-14')!;
    const plannedDay = glance.days.find((d) => d.dateKey === '2026-07-16')!;
    expect(done.height).toBeGreaterThan(0.5);
    expect(plannedDay.height).toBeGreaterThan(0.5);
  });
});
