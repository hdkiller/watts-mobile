import { describe, expect, it } from 'vitest';

import {
  extractDeepLinkPath,
  redirectSystemPathForNativeIntent,
  resolveDeepLink,
  resolveDeepLinkPath,
  resolvePushNavigation,
} from '../resolveDeepLink';

describe('extractDeepLinkPath', () => {
  it('parses coachwatts scheme with host-as-path', () => {
    expect(extractDeepLinkPath('coachwatts://today')).toBe('/today');
    expect(extractDeepLinkPath('coachwatts://notifications')).toBe('/notifications');
    expect(extractDeepLinkPath('coachwatts://activities/123')).toBe('/activities/123');
  });

  it('parses coachwatts scheme with path form', () => {
    expect(extractDeepLinkPath('coachwatts:///today')).toBe('/today');
    expect(extractDeepLinkPath('coachwatts://oauth/callback')).toBe('/oauth/callback');
  });

  it('strips https /go universal-link prefix', () => {
    expect(extractDeepLinkPath('https://coachwatts.com/go/today')).toBe('/today');
    expect(extractDeepLinkPath('https://coachwatts.com/go/planned/abc')).toBe('/planned/abc');
  });

  it('accepts bare paths', () => {
    expect(extractDeepLinkPath('/coach')).toBe('/coach');
    expect(extractDeepLinkPath('activities/9')).toBe('/activities/9');
  });
});

describe('resolveDeepLinkPath', () => {
  it('maps Today and recommendation aliases', () => {
    expect(resolveDeepLinkPath('/today')).toEqual({
      kind: 'app',
      href: '/(app)/(tabs)/today',
      canonicalPath: '/today',
    });
    expect(resolveDeepLinkPath('/today/recommendation')).toMatchObject({
      kind: 'app',
      href: '/(app)/(tabs)/today',
    });
    expect(resolveDeepLinkPath('/recommendations/rec-1')).toMatchObject({
      kind: 'app',
      href: '/(app)/(tabs)/today',
    });
  });

  it('maps planned, activity, upcoming, coach, notifications', () => {
    expect(resolveDeepLinkPath('/planned/pw-1')).toMatchObject({
      kind: 'app',
      href: '/(app)/planned/pw-1',
    });
    expect(resolveDeepLinkPath('/activities')).toMatchObject({
      kind: 'app',
      href: '/(app)/activity',
    });
    expect(resolveDeepLinkPath('/activities/act-1')).toMatchObject({
      kind: 'app',
      href: '/(app)/activity/act-1',
    });
    expect(resolveDeepLinkPath('/upcoming')).toMatchObject({
      kind: 'app',
      href: '/(app)/upcoming',
    });
    expect(resolveDeepLinkPath('/coach')).toMatchObject({
      kind: 'app',
      href: '/(app)/(tabs)/coach',
    });
    expect(resolveDeepLinkPath('/chat/room-1')).toMatchObject({
      kind: 'app',
      href: '/(app)/(tabs)/coach',
    });
    expect(resolveDeepLinkPath('/notifications')).toMatchObject({
      kind: 'app',
      href: '/(app)/notifications',
    });
  });

  it('marks oauth callback separately', () => {
    expect(resolveDeepLinkPath('/oauth/callback')).toEqual({ kind: 'oauth' });
  });

  it('returns unknown for unmapped paths', () => {
    expect(resolveDeepLinkPath('/billing').kind).toBe('unknown');
  });
});

describe('resolveDeepLink + native intent', () => {
  it('resolves scheme URLs to app hrefs', () => {
    expect(resolveDeepLink('coachwatts://coach')).toMatchObject({
      kind: 'app',
      href: '/(app)/(tabs)/coach',
    });
  });

  it('returns null for oauth so AuthSession can complete', () => {
    expect(redirectSystemPathForNativeIntent('coachwatts://oauth/callback')).toBeNull();
  });

  it('rewrites product scheme paths for Expo Router', () => {
    expect(redirectSystemPathForNativeIntent('coachwatts://today')).toBe('/(app)/(tabs)/today');
    expect(redirectSystemPathForNativeIntent('coachwatts://activities/123')).toBe(
      '/(app)/activity/123'
    );
  });
});

describe('resolvePushNavigation', () => {
  it('prefers data.path via the shared resolver', () => {
    expect(resolvePushNavigation({ path: '/activities/123', type: 'COACH_MESSAGE' })).toEqual({
      kind: 'app',
      href: '/(app)/activity/123',
      canonicalPath: '/activities/123',
    });
  });

  it('falls back to push type defaults', () => {
    expect(resolvePushNavigation({ type: 'RECOMMENDATION_READY' })).toMatchObject({
      kind: 'app',
      href: '/(app)/(tabs)/today',
    });
    expect(resolvePushNavigation({ type: 'WORKOUT_ANALYSIS_READY' })).toMatchObject({
      kind: 'app',
      href: '/(app)/activity',
    });
    expect(resolvePushNavigation({ type: 'COACH_MESSAGE' })).toMatchObject({
      kind: 'app',
      href: '/(app)/(tabs)/coach',
    });
    expect(resolvePushNavigation({ type: 'SYNC_COMPLETED' })).toMatchObject({
      kind: 'app',
      href: '/(app)/(tabs)/today',
    });
  });

  it('accepts data.url as an alias for path', () => {
    expect(resolvePushNavigation({ url: 'coachwatts://notifications' })).toMatchObject({
      kind: 'app',
      href: '/(app)/notifications',
    });
  });

  it('accepts Expo Router hrefs from server push payloads', () => {
    expect(resolvePushNavigation({ path: '/(app)/(tabs)/today' })).toEqual({
      kind: 'app',
      href: '/(app)/(tabs)/today',
      canonicalPath: '/(app)/(tabs)/today',
    });
  });
});
