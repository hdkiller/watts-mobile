import { describe, expect, it } from 'vitest';

import { ApiError, friendlyError, isAuthTokenInvalidationError, isReachabilityError } from '../errors';

describe('friendlyError', () => {
  it('maps 401/403 to session copy', () => {
    expect(friendlyError(new ApiError('Unauthorized', 401), 'fallback')).toBe(
      'Session expired — sign in again',
    );
    expect(friendlyError(new ApiError('Forbidden', 403), 'fallback')).toBe(
      'Session expired — sign in again',
    );
  });

  it('maps 404 to not-found copy', () => {
    expect(friendlyError(new ApiError('Missing', 404), 'fallback')).toBe(
      'Not found on your Coach Watts instance',
    );
  });

  it('maps 429 to quota / rate-limit copy', () => {
    expect(
      friendlyError(
        new ApiError('Chat quota exceeded. Voice transcription is unavailable.', 429),
        'fallback',
      ),
    ).toBe('Chat quota exceeded. Voice transcription is unavailable.');
    expect(friendlyError(new ApiError('', 429), 'fallback')).toBe(
      'Limit reached — try again later',
    );
  });

  it('maps 5xx with status hint', () => {
    expect(friendlyError(new ApiError('Boom', 502), 'fallback')).toBe(
      'Server error (502) — try again shortly',
    );
  });

  it('accepts duck-typed status (e.g. AnalyzeWorkoutError)', () => {
    const err = Object.assign(new Error('nope'), { status: 403 });
    expect(friendlyError(err, 'fallback')).toBe('Session expired — sign in again');
  });

  it('maps TypeError / network failures to connectivity copy', () => {
    expect(friendlyError(new TypeError('Network request failed'), 'fallback')).toBe(
      "Can't reach your Coach Watts instance — check your connection",
    );
    expect(friendlyError(new Error('Network request failed'), 'fallback')).toBe(
      "Can't reach your Coach Watts instance — check your connection",
    );
  });

  it('maps AbortError / timeout to timeout copy', () => {
    const abort = new Error('The operation was aborted');
    abort.name = 'AbortError';
    expect(friendlyError(abort, 'fallback')).toBe('Request timed out — try again');

    expect(friendlyError(new Error('Request timed out'), 'fallback')).toBe(
      'Request timed out — try again',
    );
  });

  it('returns caller fallback for unknown errors', () => {
    expect(friendlyError(new Error('weird parse failure'), 'Could not load today')).toBe(
      'Could not load today',
    );
    expect(friendlyError('string-err', 'Could not load today')).toBe('Could not load today');
    expect(friendlyError(null, 'Could not load today')).toBe('Could not load today');
  });

  it('does not treat unmapped 4xx as session/server', () => {
    expect(friendlyError(new ApiError('Conflict', 409), 'Could not save')).toBe('Could not save');
  });
});

describe('isAuthTokenInvalidationError', () => {
  it('returns true for 400 and 401 status errors', () => {
    expect(isAuthTokenInvalidationError(new ApiError('Invalid grant', 400))).toBe(true);
    expect(isAuthTokenInvalidationError(new ApiError('Unauthorized', 401))).toBe(true);
    expect(isAuthTokenInvalidationError({ status: 400 })).toBe(true);
    expect(isAuthTokenInvalidationError({ status: 401 })).toBe(true);
  });

  it('returns false for transport, network, and 5xx server errors', () => {
    expect(isAuthTokenInvalidationError(new TypeError('Network request failed'))).toBe(false);
    expect(isAuthTokenInvalidationError(new Error('Network request failed'))).toBe(false);
    expect(isAuthTokenInvalidationError(new ApiError('Internal Server Error', 500))).toBe(false);
    expect(isAuthTokenInvalidationError(new ApiError('Bad Gateway', 502))).toBe(false);
    expect(isAuthTokenInvalidationError(new ApiError('Rate limit', 429))).toBe(false);
    expect(isAuthTokenInvalidationError(null)).toBe(false);
    expect(isAuthTokenInvalidationError(undefined)).toBe(false);
  });
});

describe('isReachabilityError (CW-161)', () => {
  it('returns true for network/connectivity failures', () => {
    expect(isReachabilityError(new TypeError('Network request failed'))).toBe(true);
    expect(isReachabilityError(new Error('failed to fetch'))).toBe(true);
    expect(isReachabilityError(new Error('network error'))).toBe(true);
  });

  it('returns true for timeouts', () => {
    const abort = new Error('The operation was aborted');
    abort.name = 'AbortError';
    expect(isReachabilityError(abort)).toBe(true);
    expect(isReachabilityError(new Error('Request timed out'))).toBe(true);
  });

  it('returns true for HTTP 5xx errors', () => {
    expect(isReachabilityError(new ApiError('userinfo failed (500)', 500))).toBe(true);
    expect(isReachabilityError(new ApiError('userinfo failed (502)', 502))).toBe(true);
    expect(isReachabilityError({ status: 503 })).toBe(true);
  });

  it('returns false for definitive auth failures (401/403)', () => {
    expect(isReachabilityError(new ApiError('userinfo failed (401)', 401))).toBe(false);
    expect(isReachabilityError(new ApiError('userinfo failed (403)', 403))).toBe(false);
  });

  it('returns false for other 4xx and unclassified errors', () => {
    expect(isReachabilityError(new ApiError('Not found', 404))).toBe(false);
    expect(isReachabilityError(new Error('weird parse failure'))).toBe(false);
    expect(isReachabilityError(null)).toBe(false);
    expect(isReachabilityError(undefined)).toBe(false);
  });
});
