import { describe, expect, it } from 'vitest';

import {
  DEFAULT_E2E_LOGIN_EMAIL,
  DEFAULT_E2E_LOGIN_INSTANCE_URL,
  e2eLoginDeepLinkUrl,
  parseE2eLoginDeepLink,
} from '../e2eLoginDeepLink';

describe('parseE2eLoginDeepLink', () => {
  it('parses scheme URL with defaults when query omitted', () => {
    expect(parseE2eLoginDeepLink('coachwatts://e2e/login')).toEqual({
      email: DEFAULT_E2E_LOGIN_EMAIL,
      instanceUrl: DEFAULT_E2E_LOGIN_INSTANCE_URL,
    });
  });

  it('honors email and instance query overrides', () => {
    expect(
      parseE2eLoginDeepLink(
        'coachwatts://e2e/login?email=other%40test.local&instance=http%3A%2F%2F10.0.2.2%3A3199'
      )
    ).toEqual({
      email: 'other@test.local',
      instanceUrl: 'http://10.0.2.2:3199',
    });
  });

  it('accepts path-only /e2e/login', () => {
    expect(parseE2eLoginDeepLink('/e2e/login?email=a%40b.c')).toEqual({
      email: 'a@b.c',
      instanceUrl: DEFAULT_E2E_LOGIN_INSTANCE_URL,
    });
  });

  it('returns null for product deep links', () => {
    expect(parseE2eLoginDeepLink('coachwatts://today')).toBeNull();
    expect(parseE2eLoginDeepLink('coachwatts://oauth/callback')).toBeNull();
  });
});

describe('e2eLoginDeepLinkUrl', () => {
  it('builds the canonical Maestro openLink target', () => {
    expect(e2eLoginDeepLinkUrl()).toBe(
      'coachwatts://e2e/login?email=e2e-athlete%40coachwatts.test&instance=http%3A%2F%2F127.0.0.1%3A3199'
    );
  });
});
