import { describe, expect, it } from 'vitest';

import { allowanceWindowSuffix, formatAllowanceHint } from '../allowanceCopy';

describe('formatAllowanceHint', () => {
  it('warns only once the allowance is nearly gone', () => {
    expect(formatAllowanceHint(9)).toBeNull();
    expect(formatAllowanceHint(3)).toBeNull();
    expect(formatAllowanceHint(2)).toBe('2 left');
    expect(formatAllowanceHint(1)).toBe('1 left');
    expect(formatAllowanceHint(0)).toBe('None left');
  });

  it('stays silent without a real number', () => {
    expect(formatAllowanceHint(null)).toBeNull();
    expect(formatAllowanceHint(undefined)).toBeNull();
    expect(formatAllowanceHint(Number.POSITIVE_INFINITY)).toBeNull();
  });
});

describe('allowanceWindowSuffix', () => {
  it('reads naturally for the windows the server actually sends', () => {
    expect(allowanceWindowSuffix('calendar day')).toBe(' today');
    expect(allowanceWindowSuffix('1 day')).toBe(' today');
    expect(allowanceWindowSuffix('24 hours')).toBe(' today');
    expect(allowanceWindowSuffix('7 days')).toBe(' this week');
    expect(allowanceWindowSuffix('30 days')).toBe(' this month');
  });

  it('keeps short rolling windows explicit rather than pretending they are days', () => {
    expect(allowanceWindowSuffix('4 hours')).toBe(' in this 4-hour window');
  });

  it('says nothing when the server reports no window', () => {
    expect(allowanceWindowSuffix(undefined)).toBe('');
    expect(allowanceWindowSuffix('')).toBe('');
  });
});
