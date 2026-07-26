import { describe, expect, it } from 'vitest';

import {
  APP_SCHEME,
  OAUTH_CALLBACK_PATH,
  PUSH_TYPE_DEFAULT_PATHS,
  UNIVERSAL_LINK_PREFIX,
} from '../pathMap';

describe('pathMap constants', () => {
  it('defines canonical scheme and universal link prefix', () => {
    expect(APP_SCHEME).toBe('coachwatts');
    expect(UNIVERSAL_LINK_PREFIX).toBe('/go');
    expect(OAUTH_CALLBACK_PATH).toBe('/oauth/callback');
  });

  it('maps push event types to valid router paths', () => {
    expect(PUSH_TYPE_DEFAULT_PATHS.RECOMMENDATION_READY).toBe('/today');
    expect(PUSH_TYPE_DEFAULT_PATHS.WORKOUT_ANALYSIS_READY).toBe('/activities');
    expect(PUSH_TYPE_DEFAULT_PATHS.SYNC_COMPLETED).toBe('/today');
    expect(PUSH_TYPE_DEFAULT_PATHS.COACH_MESSAGE).toBe('/coach');
  });
});
