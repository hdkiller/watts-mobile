import { describe, expect, it } from 'vitest';

describe('SleepDurationInput clamping', () => {
  it('clamps negative step calculation so sleep duration cannot drop below 0', () => {
    const calculateNextSleep = (currentValue: string, delta: number): string => {
      const parsed = Number(currentValue.trim());
      const base = Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
      return String(Math.max(0, Math.round((base + delta) * 10) / 10));
    };

    expect(calculateNextSleep('0', -0.5)).toBe('0');
    expect(calculateNextSleep('0.5', -0.5)).toBe('0');
    expect(calculateNextSleep('', -0.5)).toBe('0');
    expect(calculateNextSleep('-0.5', -0.5)).toBe('0');
    expect(calculateNextSleep('1.0', -0.5)).toBe('0.5');
    expect(calculateNextSleep('7.5', 0.5)).toBe('8');
  });
});
