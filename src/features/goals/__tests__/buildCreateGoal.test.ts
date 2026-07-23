import { describe, expect, it } from 'vitest';

import {
  buildCreateGoalInput,
  validateGoalCreateForm,
  type GoalCreateFormValues,
} from '../buildCreateGoal';

function base(overrides: Partial<GoalCreateFormValues> = {}): GoalCreateFormValues {
  return {
    type: 'PERFORMANCE',
    title: 'Raise FTP',
    targetDate: '2026-10-15',
    priority: 'MEDIUM',
    description: '',
    metric: 'FTP',
    targetValue: '280',
    startValue: '250',
    ...overrides,
  };
}

describe('buildCreateGoal', () => {
  it('validates title and date', () => {
    expect(validateGoalCreateForm(base({ title: 'x' }))).toMatch(/title/i);
    expect(validateGoalCreateForm(base({ targetDate: '15-10-2026' }))).toMatch(/YYYY-MM-DD/);
    expect(validateGoalCreateForm(base({ targetDate: '2026-02-31' }))).toMatch(/valid target date/i);
    expect(validateGoalCreateForm(base())).toBeNull();
  });

  it('builds EVENT with eventData stub', () => {
    const input = buildCreateGoalInput(base({ type: 'EVENT', title: 'Gran fondo', metric: '' }));
    expect(input.type).toBe('EVENT');
    expect(input.eventData).toEqual({
      title: 'Gran fondo',
      date: '2026-10-15T12:00:00.000Z',
      type: 'RACE',
    });
  });

  it('includes metric values for performance', () => {
    const input = buildCreateGoalInput(base());
    expect(input.metric).toBe('FTP');
    expect(input.targetValue).toBe(280);
    expect(input.startValue).toBe(250);
    expect(input.priority).toBe('MEDIUM');
  });
});
