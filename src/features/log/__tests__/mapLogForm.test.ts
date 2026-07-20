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
    expect(formHasContent({ ...emptyLogForm(), mood: 7 })).toBe(true);
  });

  it('builds a wellness payload from form values', () => {
    const payload = toWellnessPayload(
      {
        mood: 8,
        stress: 4,
        fatigue: 5,
        soreness: 3,
        sleepHours: '7.5',
        notes: 'Felt light',
        weight: '72.2',
      },
      '2026-07-19'
    );

    expect(payload).toEqual({
      date: '2026-07-19',
      mood: 8,
      stress: 4,
      fatigue: 5,
      soreness: 3,
      sleepHours: 7.5,
      comments: 'Felt light',
      weight: 72.2,
    });
  });

  it('omits unset subjective metrics from the payload', () => {
    const payload = toWellnessPayload(
      { ...emptyLogForm(), sleepHours: '8' },
      '2026-07-19'
    );
    expect(payload).toEqual({ date: '2026-07-19', sleepHours: 8 });
  });

  it('prefills from today’s wellness row', () => {
    const today = pickTodayWellness(
      [
        { id: 'w1', date: '2026-07-18T00:00:00.000Z', mood: 5 },
        {
          id: 'w2',
          date: '2026-07-19T00:00:00.000Z',
          mood: 8,
          stress: 40,
          fatigue: 5,
          soreness: 3,
          sleepHours: 7,
          comments: 'ok',
          weight: 72,
        },
      ],
      '2026-07-19'
    );

    expect(formFromWellness(today)).toEqual({
      mood: 8,
      stress: 4,
      fatigue: 5,
      soreness: 3,
      sleepHours: '7',
      notes: 'ok',
      weight: '72',
    });
  });

  it('round-trips Pounds display weight to kg on save', () => {
    const today = pickTodayWellness(
      [{ id: 'w1', date: '2026-07-19', weight: 72.5748 }],
      '2026-07-19'
    );
    const form = formFromWellness(today, 'Pounds');
    expect(Number(form.weight)).toBeCloseTo(160, 0);

    const payload = toWellnessPayload(
      { ...emptyLogForm(), weight: form.weight },
      '2026-07-19',
      'Pounds'
    );
    expect(payload.weight).toBeCloseTo(72.575, 2);
  });
});
