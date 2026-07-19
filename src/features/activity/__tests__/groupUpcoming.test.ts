import { describe, expect, it } from 'vitest';

import { groupUpcomingByDay } from '@/src/features/activity/groupUpcoming';
import type { PlannedListItem } from '@/src/features/activity/types';

function plan(partial: Partial<PlannedListItem> & { id: string; date: string }): PlannedListItem {
  return {
    id: partial.id,
    title: partial.title ?? 'Plan',
    date: partial.date,
    type: partial.type ?? 'Ride',
    durationSec: 3600,
    tss: 50,
  };
}

describe('groupUpcomingByDay', () => {
  it('labels Today / Tomorrow / weekday headers', () => {
    const now = new Date(2026, 6, 19, 12, 0, 0); // Sun Jul 19
    const sections = groupUpcomingByDay(
      [
        plan({ id: '1', date: '2026-07-19T10:00:00', title: 'A' }),
        plan({ id: '2', date: '2026-07-20T10:00:00', title: 'B' }),
        plan({ id: '3', date: '2026-07-23T10:00:00', title: 'C' }),
      ],
      now
    );
    expect(sections.map((s) => s.title)).toEqual([
      'Today',
      'Tomorrow',
      expect.stringMatching(/Thu/),
    ]);
    expect(sections[2]?.data[0]?.id).toBe('3');
  });
});
