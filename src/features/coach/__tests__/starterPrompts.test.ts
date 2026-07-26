import { describe, expect, it } from 'vitest';

import {
  COACH_STARTER_PROMPTS,
  DISCUSS_SESSION_PROMPT,
  DISCUSS_TODAY_PROMPT,
} from '../starterPrompts';

describe('starterPrompts', () => {
  it('defines valid discuss prompts for Today and session details', () => {
    expect(typeof DISCUSS_TODAY_PROMPT).toBe('string');
    expect(DISCUSS_TODAY_PROMPT.length).toBeGreaterThan(10);

    expect(typeof DISCUSS_SESSION_PROMPT).toBe('string');
    expect(DISCUSS_SESSION_PROMPT.length).toBeGreaterThan(10);
  });

  it('defines brand-aligned coach starter prompts', () => {
    expect(COACH_STARTER_PROMPTS.length).toBeGreaterThan(0);
    for (const prompt of COACH_STARTER_PROMPTS) {
      expect(prompt).toHaveProperty('id');
      expect(prompt).toHaveProperty('label');
      expect(prompt).toHaveProperty('text');
      expect(prompt.id.length).toBeGreaterThan(0);
      expect(prompt.label.length).toBeGreaterThan(0);
      expect(prompt.text.length).toBeGreaterThan(0);
    }
  });
});
