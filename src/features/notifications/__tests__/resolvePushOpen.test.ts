import { describe, expect, it } from 'vitest';

import { APP_HREFS } from '@/src/linking/appHrefs';

import { resolvePushOpen } from '../resolvePushOpen';

describe('resolvePushOpen', () => {
  it('prefers data.path over type', () => {
    expect(resolvePushOpen({ path: '/activities/123', type: 'COACH_MESSAGE' })).toEqual({
      kind: 'app',
      href: APP_HREFS.activityDetail('123'),
      canonicalPath: '/activities/123',
    });
  });

  it('accepts Expo Router hrefs from the server', () => {
    expect(resolvePushOpen({ path: '/(app)/(tabs)/today', type: 'RECOMMENDATION_READY' })).toEqual({
      kind: 'app',
      href: '/(app)/(tabs)/today',
      canonicalPath: '/(app)/(tabs)/today',
    });
  });

  it('migrates legacy root-stack Expo Router hrefs', () => {
    expect(resolvePushOpen({ path: '/(app)/activity/123' })).toMatchObject({
      href: APP_HREFS.activityDetail('123'),
    });
    expect(resolvePushOpen({ path: '/(app)/notifications' })).toMatchObject({
      href: APP_HREFS.notifications,
    });
  });

  it('falls back to type defaults', () => {
    expect(resolvePushOpen({ type: 'RECOMMENDATION_READY' })).toMatchObject({
      kind: 'app',
      href: APP_HREFS.today,
    });
    expect(resolvePushOpen({ type: 'WORKOUT_ANALYSIS_READY' })).toMatchObject({
      kind: 'app',
      href: APP_HREFS.activityList,
    });
    expect(resolvePushOpen({ type: 'COACH_MESSAGE' })).toMatchObject({
      kind: 'app',
      href: APP_HREFS.coach,
    });
    expect(resolvePushOpen({ type: 'SYNC_COMPLETED' })).toMatchObject({
      kind: 'app',
      href: APP_HREFS.today,
    });
  });

  it('accepts data.url scheme aliases', () => {
    expect(resolvePushOpen({ url: 'coachwatts://notifications' })).toMatchObject({
      kind: 'app',
      href: APP_HREFS.notifications,
    });
  });

  it('returns unknown when nothing resolvable', () => {
    expect(resolvePushOpen({}).kind).toBe('unknown');
    expect(resolvePushOpen(null).kind).toBe('unknown');
  });
});
