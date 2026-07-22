import { describe, expect, it } from 'vitest';

import { APP_HREFS } from '../appHrefs';
import {
  extractDeepLinkPath,
  redirectSystemPathForNativeIntent,
  resolveDeepLink,
  resolveDeepLinkPath,
  resolvePushNavigation,
} from '../resolveDeepLink';

describe('extractDeepLinkPath', () => {
  it('parses scheme host+path', () => {
    expect(extractDeepLinkPath('coachwatts://notifications')).toBe('/notifications');
  });

  it('strips universal /go prefix', () => {
    expect(extractDeepLinkPath('https://coachwatts.com/go/planned/abc')).toBe('/planned/abc');
  });
});

describe('resolveDeepLinkPath', () => {
  it('maps today aliases', () => {
    expect(resolveDeepLinkPath('/today')).toEqual({
      kind: 'app',
      href: APP_HREFS.today,
      canonicalPath: '/today',
    });
    expect(resolveDeepLinkPath('/today/recommendation')).toMatchObject({
      kind: 'app',
      href: APP_HREFS.today,
    });
    expect(resolveDeepLinkPath('/recommendations/rec-1')).toMatchObject({
      kind: 'app',
      href: APP_HREFS.today,
    });
  });

  it('maps planned, activity, upcoming, coach, notifications into tab stacks', () => {
    expect(resolveDeepLinkPath('/planned/pw-1')).toMatchObject({
      kind: 'app',
      href: APP_HREFS.plannedDetail('pw-1'),
    });
    expect(resolveDeepLinkPath('/activities')).toMatchObject({
      kind: 'app',
      href: APP_HREFS.activityList,
    });
    expect(resolveDeepLinkPath('/activities/act-1')).toMatchObject({
      kind: 'app',
      href: APP_HREFS.activityDetail('act-1'),
    });
    expect(resolveDeepLinkPath('/upcoming')).toMatchObject({
      kind: 'app',
      href: APP_HREFS.upcoming,
    });
    expect(resolveDeepLinkPath('/events')).toMatchObject({
      kind: 'app',
      href: APP_HREFS.eventsList,
    });
    expect(resolveDeepLinkPath('/events/ev-1')).toMatchObject({
      kind: 'app',
      href: APP_HREFS.eventDetail('ev-1'),
    });
    expect(resolveDeepLinkPath('/coach')).toMatchObject({
      kind: 'app',
      href: APP_HREFS.coach,
    });
    expect(resolveDeepLinkPath('/chat/room-1')).toEqual({
      kind: 'app',
      href: `${APP_HREFS.coach}?roomId=room-1`,
      canonicalPath: '/chat/room-1',
    });
    expect(resolveDeepLinkPath('/notifications')).toMatchObject({
      kind: 'app',
      href: APP_HREFS.notifications,
    });
    expect(resolveDeepLinkPath('/more')).toMatchObject({
      kind: 'app',
      href: APP_HREFS.more,
    });
    expect(resolveDeepLinkPath('/log')).toMatchObject({
      kind: 'app',
      href: APP_HREFS.log,
    });
    const scanMeal = resolveDeepLinkPath('/scan-meal');
    expect(scanMeal.kind).toBe('app');
    if (scanMeal.kind === 'app') {
      expect(scanMeal.href).toMatch(
        new RegExp(`^${APP_HREFS.log.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\?action=camera&t=\\d+$`)
      );
    }
    const camera = resolveDeepLinkPath('/camera');
    expect(camera.kind).toBe('app');
    if (camera.kind === 'app') {
      expect(camera.href).toMatch(
        new RegExp(`^${APP_HREFS.log.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\?action=camera&t=\\d+$`)
      );
      expect(camera.href).not.toBe(scanMeal.kind === 'app' ? scanMeal.href : '');
    }
  });

  it('keeps oauth callback out of product routing', () => {
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
      href: APP_HREFS.coach,
    });
  });

  it('rewrites system paths for native intent', () => {
    expect(redirectSystemPathForNativeIntent('coachwatts://activities/123')).toBe(
      APP_HREFS.activityDetail('123')
    );
  });
});

describe('resolvePushNavigation', () => {
  it('uses path, then type defaults', () => {
    expect(resolvePushNavigation({ path: '/activities/123' })).toMatchObject({
      kind: 'app',
      href: APP_HREFS.activityDetail('123'),
    });
    expect(resolvePushNavigation({ type: 'RECOMMENDATION_READY' })).toMatchObject({
      href: APP_HREFS.today,
    });
    expect(resolvePushNavigation({ type: 'WORKOUT_ANALYSIS_READY' })).toMatchObject({
      href: APP_HREFS.activityList,
    });
    expect(resolvePushNavigation({ type: 'COACH_MESSAGE' })).toMatchObject({
      href: APP_HREFS.coach,
    });
    expect(resolvePushNavigation({ type: 'SYNC_COMPLETED' })).toMatchObject({
      href: APP_HREFS.today,
    });
  });

  it('migrates legacy Expo Router hrefs from server push payloads', () => {
    expect(resolvePushNavigation({ path: '/(app)/activity/123' })).toMatchObject({
      href: APP_HREFS.activityDetail('123'),
    });
    expect(resolvePushNavigation({ path: '/(app)/notifications' })).toMatchObject({
      href: APP_HREFS.notifications,
    });
    expect(resolvePushNavigation({ path: '/(app)/(tabs)/today' })).toMatchObject({
      href: '/(app)/(tabs)/today',
    });
  });

  it('accepts current Expo Router hrefs from server push payloads', () => {
    expect(
      resolvePushNavigation({ path: '/(app)/(tabs)/today/activity/123' })
    ).toMatchObject({
      href: '/(app)/(tabs)/today/activity/123',
    });
  });
});
