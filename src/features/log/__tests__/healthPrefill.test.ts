import { describe, expect, it } from 'vitest';

import { applyHealthPrefill } from '@/src/features/log/applyHealthPrefill';
import { emptyLogForm } from '@/src/features/log/mapLogForm';

describe('applyHealthPrefill', () => {
  it('fills empty sleep and weight only', () => {
    const form = emptyLogForm();
    form.readiness = '7';
    const next = applyHealthPrefill(form, {
      sleepHours: '7.5',
      weightKg: '72.2',
      source: 'healthkit',
    });
    expect(next.sleepHours).toBe('7.5');
    expect(next.weight).toBe('72.2');
    expect(next.readiness).toBe('7');
  });

  it('does not overwrite athlete-entered fields', () => {
    const form = emptyLogForm();
    form.sleepHours = '8';
    form.weight = '70';
    const next = applyHealthPrefill(form, {
      sleepHours: '7.5',
      weightKg: '72.2',
      source: 'healthkit',
    });
    expect(next.sleepHours).toBe('8');
    expect(next.weight).toBe('70');
  });

  it('converts kg to lb when profile uses lb', () => {
    const next = applyHealthPrefill(
      emptyLogForm(),
      { weightKg: '70', source: 'health_connect' },
      { weightUnit: 'lb' }
    );
    expect(Number(next.weight)).toBeCloseTo(154.3, 0);
  });
});
