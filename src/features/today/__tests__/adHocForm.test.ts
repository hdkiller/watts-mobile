import { describe, expect, it } from 'vitest';

import { validateAdHocForm } from '../adHocForm';

describe('validateAdHocForm', () => {
  it('accepts web defaults', () => {
    const result = validateAdHocForm({
      type: 'Ride',
      durationText: '60',
      intensity: 'Endurance',
      notes: '',
    });
    expect(result).toEqual({
      ok: true,
      payload: {
        type: 'Ride',
        durationMinutes: 60,
        intensity: 'Endurance',
        notes: '',
      },
    });
  });

  it('rejects zero or invalid duration', () => {
    expect(
      validateAdHocForm({
        type: 'Run',
        durationText: '0',
        intensity: 'Tempo',
        notes: '',
      }).ok,
    ).toBe(false);
    expect(
      validateAdHocForm({
        type: 'Run',
        durationText: '',
        intensity: 'Tempo',
        notes: '',
      }).ok,
    ).toBe(false);
  });

  it('rejects durations that round to zero minutes', () => {
    const result = validateAdHocForm({
      type: 'Run',
      durationText: '0.4',
      intensity: 'Tempo',
      notes: '',
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('Enter a duration of at least 1 minute.');
    }
  });

  it('accepts a duration that rounds up to one minute', () => {
    const result = validateAdHocForm({
      type: 'Run',
      durationText: '0.6',
      intensity: 'Tempo',
      notes: '',
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.payload.durationMinutes).toBe(1);
    }
  });

  it('trims notes', () => {
    const result = validateAdHocForm({
      type: 'Swim',
      durationText: '45.4',
      intensity: 'Recovery',
      notes: '  high cadence  ',
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.payload.durationMinutes).toBe(45);
      expect(result.payload.notes).toBe('high cadence');
    }
  });
});
