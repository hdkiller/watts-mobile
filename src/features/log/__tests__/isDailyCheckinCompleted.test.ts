import { describe, expect, it } from 'vitest';

import { isDailyCheckinCompleted } from '../isDailyCheckinCompleted';

describe('isDailyCheckinCompleted', () => {
  it('is false when missing or empty', () => {
    expect(isDailyCheckinCompleted(null)).toBe(false);
    expect(isDailyCheckinCompleted({ questions: [] })).toBe(false);
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
