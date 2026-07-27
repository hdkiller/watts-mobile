import { describe, expect, it } from 'vitest';

import { isTypingList, pickTypingFloorMs } from '../useTypingFloor';
import type { CoachUIMessage } from '../types';

function message(id: string, syntheticTyping = false): CoachUIMessage {
  return {
    id,
    role: 'assistant',
    parts: [],
    content: '',
    createdAt: new Date(),
    ...(syntheticTyping ? { metadata: { syntheticTyping: true } } : {}),
  };
}

describe('useTypingFloor helpers', () => {
  it('keeps the floor inside 350-650ms', () => {
    expect(pickTypingFloorMs(() => 0)).toBe(350);
    expect(pickTypingFloorMs(() => 1)).toBe(650);
    expect(pickTypingFloorMs(() => 0.5)).toBe(500);
  });

  it('detects the typing bubble only as the tail entry', () => {
    expect(isTypingList([])).toBe(false);
    expect(isTypingList([message('a')])).toBe(false);
    expect(isTypingList([message('a'), message('typing-1', true)])).toBe(true);
    // A stale typing entry mid-list must not hold the whole list back.
    expect(isTypingList([message('typing-1', true), message('a')])).toBe(false);
  });
});
