import { describe, expect, it } from 'vitest';

import { shouldApplyStreamCallback } from '../streamGeneration';

describe('shouldApplyStreamCallback', () => {
  it('applies when the stream generation matches the live room generation', () => {
    expect(shouldApplyStreamCallback(1, 1)).toBe(true);
  });

  it('ignores a late callback from a stream started before a room switch', () => {
    // Room switch mid-reply bumps the room generation (CW-165); the old
    // stream's onFinish/onError still captured the pre-switch generation.
    expect(shouldApplyStreamCallback(1, 2)).toBe(false);
  });

  it('ignores a callback if the generation somehow regressed', () => {
    expect(shouldApplyStreamCallback(3, 2)).toBe(false);
  });
});
