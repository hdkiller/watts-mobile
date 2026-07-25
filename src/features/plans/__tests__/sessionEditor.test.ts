import { describe, expect, it } from 'vitest';

import {
  emptySessionEditorForm,
  sessionEditorFormFromValues,
  validateSessionEditorForm,
} from '../sessionEditor';

describe('validateSessionEditorForm', () => {
  it('requires title, type, duration, and date', () => {
    const result = validateSessionEditorForm({
      ...emptySessionEditorForm(''),
      title: '',
      durationMinutes: '',
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.fieldErrors.title).toBeTruthy();
      expect(result.fieldErrors.durationMinutes).toBeTruthy();
      expect(result.fieldErrors.dateKey).toBeTruthy();
    }
  });

  it('builds create/patch payload with duration seconds', () => {
    const result = validateSessionEditorForm({
      dateKey: '2026-07-22',
      title: ' Club ride ',
      type: 'Ride',
      durationMinutes: '90',
      tss: '75',
      description: 'Easy pace',
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.payload).toEqual({
        dateKey: '2026-07-22',
        title: 'Club ride',
        type: 'Ride',
        durationSec: 5400,
        tss: 75,
        description: 'Easy pace',
      });
    }
  });

  it('allows empty optional TSS and description', () => {
    const result = validateSessionEditorForm({
      dateKey: '2026-07-22',
      title: 'Run',
      type: 'Run',
      durationMinutes: '45',
      tss: '',
      description: '  ',
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.payload.tss).toBeNull();
      expect(result.payload.description).toBeNull();
    }
  });

  it('rejects non-numeric TSS', () => {
    const result = validateSessionEditorForm({
      dateKey: '2026-07-22',
      title: 'Ride',
      type: 'Ride',
      durationMinutes: '60',
      tss: 'abc',
      description: '',
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.fieldErrors.tss).toBeTruthy();
    }
  });
});

describe('sessionEditorFormFromValues', () => {
  it('prefills edit form from an existing session', () => {
    const form = sessionEditorFormFromValues({
      dateKey: '2026-07-23',
      title: 'Tempo',
      type: 'Run',
      durationSec: 3600,
      tss: 68,
      description: 'Z3',
    });
    expect(form).toMatchObject({
      dateKey: '2026-07-23',
      title: 'Tempo',
      type: 'Run',
      durationMinutes: '60',
      tss: '68',
      description: 'Z3',
    });
  });
});
