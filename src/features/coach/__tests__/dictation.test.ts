import { describe, expect, it } from 'vitest';

import { appendTranscript } from '../dictation';

describe('appendTranscript', () => {
  it('returns current when transcript is empty', () => {
    expect(appendTranscript('Hello', '  ')).toBe('Hello');
  });

  it('uses transcript alone when composer is empty', () => {
    expect(appendTranscript('', '  Feeling tired  ')).toBe('Feeling tired');
    expect(appendTranscript('   ', 'Feeling tired')).toBe('Feeling tired');
  });

  it('appends with a space when needed', () => {
    expect(appendTranscript('Hello', 'there')).toBe('Hello there');
  });

  it('does not double-space when composer already ends with whitespace', () => {
    expect(appendTranscript('Hello ', 'there')).toBe('Hello there');
    expect(appendTranscript('Hello\n', 'there')).toBe('Hello\nthere');
  });
});
