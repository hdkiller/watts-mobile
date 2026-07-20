import { describe, expect, it } from 'vitest';

import { isDailyCheckinCompleted } from '../isDailyCheckinCompleted';

describe('isDailyCheckinCompleted', () => {
  it('is false when check-in is missing', () => {
    expect(isDailyCheckinCompleted(null)).toBe(false);
    expect(isDailyCheckinCompleted(undefined)).toBe(false);
  });

  it('is true when there are no questions (nothing needed)', () => {
    expect(isDailyCheckinCompleted({ questions: [] })).toBe(true);
  });

  it('is false when any question unanswered', () => {
    expect(
      isDailyCheckinCompleted({
        questions: [
          { id: 'a', text: 'Q1', answer: 'YES' },
          { id: 'b', text: 'Q2', answer: null },
        ],
      })
    ).toBe(false);
  });

  it('is true when every question has YES/NO', () => {
    expect(
      isDailyCheckinCompleted({
        questions: [
          { id: 'a', text: 'Q1', answer: 'YES' },
          { id: 'b', text: 'Q2', answer: 'NO' },
        ],
      })
    ).toBe(true);
  });
});
