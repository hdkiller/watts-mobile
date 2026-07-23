import { describe, expect, it } from 'vitest';

import { ApiError, friendlyError } from '../errors';

describe('friendlyError', () => {
  it('maps 401/403 to session copy', () => {
    expect(friendlyError(new ApiError('Unauthorized', 401), 'fallback')).toBe(
      'Session expired — sign in again'
    );
    expect(friendlyError(new ApiError('Forbidden', 403), 'fallback')).toBe(
      'Session expired — sign in again'
    );
  });

  it('maps 404 to not-found copy', () => {
    expect(friendlyError(new ApiError('Missing', 404), 'fallback')).toBe(
      'Not found on your Coach Watts instance'
    );
  });

  it('maps 429 to quota / rate-limit copy', () => {
    expect(
      friendlyError(
        new ApiError('Chat quota exceeded. Voice transcription is unavailable.', 429),
        'fallback'
      )
    ).toBe('Chat quota exceeded. Voice transcription is unavailable.');
    expect(friendlyError(new ApiError('', 429), 'fallback')).toBe('Limit reached — try again later');
  });

  it('maps 5xx with status hint', () => {
    expect(friendlyError(new ApiError('Boom', 502), 'fallback')).toBe(
      'Server error (502) — try again shortly'
    );
  });

  it('accepts duck-typed status (e.g. AnalyzeWorkoutError)', () => {
    const err = Object.assign(new Error('nope'), { status: 403 });
    expect(friendlyError(err, 'fallback')).toBe('Session expired — sign in again');
  });

  it('maps TypeError / network failures to connectivity copy', () => {
    expect(friendlyError(new TypeError('Network request failed'), 'fallback')).toBe(
      "Can't reach your Coach Watts instance — check your connection"
    );
    expect(friendlyError(new Error('Network request failed'), 'fallback')).toBe(
      "Can't reach your Coach Watts instance — check your connection"
    );
  });

  it('maps AbortError / timeout to timeout copy', () => {
    const abort = new Error('The operation was aborted');
    abort.name = 'AbortError';
    expect(friendlyError(abort, 'fallback')).toBe('Request timed out — try again');

    expect(friendlyError(new Error('Request timed out'), 'fallback')).toBe(
      'Request timed out — try again'
    );
  });

  it('returns caller fallback for unknown errors', () => {
    expect(friendlyError(new Error('weird parse failure'), 'Could not load today')).toBe(
      'Could not load today'
    );
    expect(friendlyError('string-err', 'Could not load today')).toBe('Could not load today');
    expect(friendlyError(null, 'Could not load today')).toBe('Could not load today');
  });

  it('does not treat unmapped 4xx as session/server', () => {
    expect(friendlyError(new ApiError('Conflict', 409), 'Could not save')).toBe('Could not save');
  });
});
