import { describe, expect, it } from 'vitest';

import { isDailyCheckinCompleted } from '../isDailyCheckinCompleted';

describe('isDailyCheckinCompleted', () => {
  it('returns false when check-in is missing', () => {
    expect(isDailyCheckinCompleted(null)).toBe(false);
    expect(isDailyCheckinCompleted(undefined)).toBe(false);
  });

  it('returns false when status is PENDING, PROCESSING, or FAILED even if questions are empty', () => {
    expect(isDailyCheckinCompleted({ status: 'PENDING', questions: [] })).toBe(false);
    expect(isDailyCheckinCompleted({ status: 'PROCESSING', questions: [] })).toBe(false);
    expect(isDailyCheckinCompleted({ status: 'FAILED', questions: [] })).toBe(false);
  });

  it('returns false when status is PENDING, PROCESSING, or FAILED with questions', () => {
    expect(
      isDailyCheckinCompleted({
        status: 'PENDING',
        questions: [{ id: '1', text: 'Q1', answer: 'YES' }],
      }),
    ).toBe(false);
    expect(
      isDailyCheckinCompleted({
        status: 'PROCESSING',
        questions: [{ id: '1', text: 'Q1', answer: 'YES' }],
      }),
    ).toBe(false);
    expect(
      isDailyCheckinCompleted({
        status: 'FAILED',
        questions: [{ id: '1', text: 'Q1', answer: 'YES' }],
      }),
    ).toBe(false);
  });

  it('returns true when status is COMPLETED or SAVED with empty questions', () => {
    expect(isDailyCheckinCompleted({ status: 'COMPLETED', questions: [] })).toBe(true);
    expect(isDailyCheckinCompleted({ status: 'SAVED', questions: [] })).toBe(true);
  });

  it('returns true when all questions are answered and status is COMPLETED or SAVED', () => {
    expect(
      isDailyCheckinCompleted({
        status: 'COMPLETED',
        questions: [
          { id: '1', text: 'Q1', answer: 'YES' },
          { id: '2', text: 'Q2', answer: 'NO' },
        ],
      }),
    ).toBe(true);
    expect(
      isDailyCheckinCompleted({
        status: 'SAVED',
        questions: [
          { id: '1', text: 'Q1', answer: 'YES' },
          { id: '2', text: 'Q2', answer: 'NO' },
        ],
      }),
    ).toBe(true);
  });

  it('returns false when any question is unanswered', () => {
    expect(
      isDailyCheckinCompleted({
        status: 'COMPLETED',
        questions: [
          { id: '1', text: 'Q1', answer: 'YES' },
          { id: '2', text: 'Q2', answer: null },
        ],
      }),
    ).toBe(false);
    expect(
      isDailyCheckinCompleted({
        status: 'SAVED',
        questions: [
          { id: '1', text: 'Q1', answer: 'YES' },
          { id: '2', text: 'Q2', answer: null },
        ],
      }),
    ).toBe(false);
  });
});
