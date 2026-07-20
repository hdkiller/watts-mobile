import { describe, expect, it } from 'vitest';

import { humanizeWorkoutType } from '../humanizeWorkoutType';

describe('humanizeWorkoutType', () => {
  it('splits camelCase enums', () => {
    expect(humanizeWorkoutType('WeightTraining')).toBe('Weight training');
    expect(humanizeWorkoutType('VirtualRun')).toBe('Virtual run');
    expect(humanizeWorkoutType('TrailRun')).toBe('Trail run');
  });

  it('keeps known acronyms uppercase', () => {
    expect(humanizeWorkoutType('MTB')).toBe('MTB');
    expect(humanizeWorkoutType('ftpTest')).toBe('FTP test');
  });

  it('handles empty', () => {
    expect(humanizeWorkoutType(null)).toBeNull();
    expect(humanizeWorkoutType('')).toBeNull();
    expect(humanizeWorkoutType('Ride')).toBe('Ride');
  });
});
