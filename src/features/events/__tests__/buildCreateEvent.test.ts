import { describe, expect, it } from 'vitest';

import {
  buildCreateEventInput,
  defaultEventDateYmd,
  validateEventCreateForm,
  type EventCreateFormValues,
} from '../buildCreateEvent';

function base(overrides: Partial<EventCreateFormValues> = {}): EventCreateFormValues {
  return {
    title: 'Autumn fondo',
    date: '2026-10-15',
    type: 'Ride',
    priority: 'A',
    location: 'Tuscany',
    description: 'A-priority race',
    startTime: '09:00',
    ...overrides,
  };
}

describe('buildCreateEvent', () => {
  it('validates title and date', () => {
    expect(validateEventCreateForm(base({ title: '  ' }))).toMatch(/title/i);
    expect(validateEventCreateForm(base({ date: 'bad' }))).toMatch(/YYYY-MM-DD/);
    expect(validateEventCreateForm(base({ date: '2026-02-31' }))).toMatch(/valid date/i);
    expect(validateEventCreateForm(base())).toBeNull();
  });

  it('defaults to a local calendar YMD', () => {
    const ymd = defaultEventDateYmd(0);
    expect(ymd).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    const [y, m, d] = ymd.split('-').map(Number);
    const now = new Date();
    expect(y).toBe(now.getFullYear());
    expect(m).toBe(now.getMonth() + 1);
    expect(d).toBe(now.getDate());
  });

  it('builds lite POST body', () => {
    expect(buildCreateEventInput(base())).toEqual({
      title: 'Autumn fondo',
      date: '2026-10-15T12:00:00.000Z',
      type: 'Ride',
      priority: 'A',
      location: 'Tuscany',
      description: 'A-priority race',
      startTime: '09:00',
    });
  });

  it('omits empty optionals', () => {
    expect(
      buildCreateEventInput(
        base({ priority: '', location: '', description: '', startTime: '', type: '' })
      )
    ).toEqual({
      title: 'Autumn fondo',
      date: '2026-10-15T12:00:00.000Z',
    });
  });
});
