import { beforeEach, describe, expect, it } from 'vitest';

import {
  _resetLogTabPreferenceForTests,
  logTabOrder,
  resolveDefaultLogTab,
} from '../logTabPreference';

describe('logTabOrder', () => {
  it('puts nutrition first when enabled and includes measurements', () => {
    expect(logTabOrder(true)).toEqual([
      'nutrition',
      'recovery',
      'wellness',
      'measurements',
    ]);
  });

  it('omits nutrition when disabled but keeps measurements', () => {
    expect(logTabOrder(false)).toEqual(['recovery', 'wellness', 'measurements']);
  });
});

describe('resolveDefaultLogTab', () => {
  beforeEach(() => {
    _resetLogTabPreferenceForTests();
  });

  it('auto prefers nutrition when tracking is on', () => {
    expect(resolveDefaultLogTab('auto', true)).toBe('nutrition');
  });

  it('auto prefers recovery when tracking is off', () => {
    expect(resolveDefaultLogTab('auto', false)).toBe('recovery');
  });

  it('falls back from nutrition preference when tracking is off', () => {
    expect(resolveDefaultLogTab('nutrition', false)).toBe('recovery');
  });

  it('honors explicit wellness, recovery, and measurements', () => {
    expect(resolveDefaultLogTab('wellness', true)).toBe('wellness');
    expect(resolveDefaultLogTab('recovery', true)).toBe('recovery');
    expect(resolveDefaultLogTab('measurements', true)).toBe('measurements');
  });
});
