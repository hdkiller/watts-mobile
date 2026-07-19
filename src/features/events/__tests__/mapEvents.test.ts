import { describe, expect, it } from 'vitest';

import { countdownLabel, daysUntilLocal, mapUpcomingEvents } from '@/src/features/events/mapEvents';

describe('mapEvents', () => {
  const now = new Date(2026, 6, 19, 15, 0, 0); // local Jul 19

  it('computes whole-day countdown', () => {
    expect(daysUntilLocal('2026-07-19T23:00:00', now)).toBe(0);
    expect(daysUntilLocal('2026-07-20T01:00:00', now)).toBe(1);
    expect(daysUntilLocal('2026-08-11T12:00:00', now)).toBe(23);
  });

  it('excludes past events and sorts upcoming', () => {
    const list = mapUpcomingEvents(
      [
        { id: '1', title: 'Past', date: '2026-07-10T12:00:00' },
        { id: '2', title: 'Gran Fondo', date: '2026-08-11T12:00:00' },
        { id: '3', title: 'Crit', date: '2026-07-22T12:00:00' },
      ],
      now
    );
    expect(list.map((e) => e.id)).toEqual(['3', '2']);
    expect(list[0]?.countdownLabel).toBe('3 days');
    expect(list[1]?.daysUntil).toBe(23);
  });

  it('formats today / 1 day labels', () => {
    expect(countdownLabel(0)).toBe('Today');
    expect(countdownLabel(1)).toBe('1 day');
    expect(countdownLabel(23)).toBe('23 days');
  });
});
