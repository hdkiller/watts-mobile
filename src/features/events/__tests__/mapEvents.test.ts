import { describe, expect, it } from 'vitest';

import {
  countdownLabel,
  daysUntilLocal,
  formatEventMeta,
  mapEventDetail,
  mapUpcomingEvents,
} from '@/src/features/events/mapEvents';

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

  it('builds web-parity meta with city/country and location fallback', () => {
    expect(
      formatEventMeta({
        id: '1',
        title: 'Race',
        type: 'Race',
        subType: 'Gran Fondo',
        city: 'Nice',
        country: 'France',
      })
    ).toBe('Gran Fondo · Nice, France');

    expect(
      formatEventMeta({
        id: '2',
        title: 'Local',
        type: 'Life',
        location: 'Home course',
      })
    ).toBe('Life · Home course');

    expect(formatEventMeta({ id: '3', title: 'Bare', type: 'Race' })).toBe('Race');
  });

  it('includes month/day and meta on glances', () => {
    const list = mapUpcomingEvents(
      [
        {
          id: 'e1',
          title: 'Alpe d’Huez',
          date: '2026-07-22T08:00:00',
          type: 'Race',
          subType: 'Gran Fondo',
          city: 'Alpe d’Huez',
          country: 'France',
          priority: 'A',
        },
      ],
      now
    );
    expect(list[0]).toMatchObject({
      id: 'e1',
      meta: 'Gran Fondo · Alpe d’Huez, France',
      monthLabel: expect.any(String),
      dayLabel: '22',
      priority: 'A',
      countdownLabel: '3 days',
    });
  });

  it('maps detail tiles and goals; omits empty stats', () => {
    const detail = mapEventDetail(
      {
        id: 'e1',
        title: 'Ironman',
        date: '2026-08-01T07:00:00',
        type: 'Race',
        subType: 'Triathlon',
        priority: 'A',
        distance: 180.2,
        elevation: 1200,
        city: 'Nice',
        country: 'France',
        startTime: '07:00',
        description: 'A-race.',
        websiteUrl: 'https://example.com',
        goals: [
          {
            id: 'g1',
            title: 'Sub-10',
            status: 'ACTIVE',
            targetDate: '2026-08-01',
          },
          { id: 'g2', title: '  ' },
        ],
      },
      now
    );

    expect(detail).toMatchObject({
      id: 'e1',
      title: 'Ironman',
      typeLine: 'Race / Triathlon',
      priority: 'A',
      distanceKm: 180.2,
      elevationM: 1200,
      locationLabel: 'Nice, France',
      startTime: '07:00',
      description: 'A-race.',
      countdownLabel: '13 days',
    });
    expect(detail?.goals).toEqual([
      {
        id: 'g1',
        title: 'Sub-10',
        status: 'ACTIVE',
        targetDateLabel: expect.any(String),
      },
    ]);

    const sparse = mapEventDetail(
      { id: 'e2', title: 'Coffee ride', date: '2026-07-25T09:00:00', type: 'Life' },
      now
    );
    expect(sparse?.distanceKm).toBeNull();
    expect(sparse?.elevationM).toBeNull();
    expect(sparse?.locationLabel).toBeNull();
    expect(sparse?.goals).toEqual([]);
  });
});
