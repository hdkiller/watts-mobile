import { describe, expect, it } from 'vitest';

import {
  emptyLogForm,
  formHasContent,
  formFromWellness,
  pickTodayWellness,
  toWellnessPayload,
} from '../mapLogForm';

describe('mapLogForm', () => {
  it('detects empty vs filled forms', () => {
    expect(formHasContent(emptyLogForm())).toBe(false);
    expect(formHasContent({ ...emptyLogForm(), readiness: '7' })).toBe(true);
  });

  it('builds a wellness payload from form values', () => {
    const payload = toWellnessPayload(
      {
        readiness: '8',
        sleepHours: '7.5',
        sleepQuality: '4',
        notes: 'Felt light',
        weight: '72.2',
      },
      '2026-07-19'
    );

    expect(payload).toEqual({
      date: '2026-07-19',
      readiness: 8,
      sleepHours: 7.5,
      sleepQuality: 4,
      comments: 'Felt light',
      weight: 72.2,
    });
  });

  it('prefills from today’s wellness row', () => {
    const today = pickTodayWellness(
      [
        { id: 'w1', date: '2026-07-18T00:00:00.000Z', readiness: 5 },
        {
          id: 'w2',
          date: '2026-07-19T00:00:00.000Z',
          readiness: 8,
          sleepHours: 7,
          sleepQuality: 4,
          comments: 'ok',
          weight: 72,
        },
      ],
      '2026-07-19'
    );

    expect(formFromWellness(today)).toEqual({
      readiness: '8',
      sleepHours: '7',
      sleepQuality: '4',
      notes: 'ok',
      weight: '72',
    });
  });
});
