import { describe, expect, it } from 'vitest';

import { COMPANION_SCOPE_STRING, COMPANION_SCOPES } from '../scopes';

describe('auth scopes', () => {
  it('defines required companion OAuth scopes', () => {
    expect(COMPANION_SCOPES).toContain('profile:read');
    expect(COMPANION_SCOPES).toContain('profile:write');
    expect(COMPANION_SCOPES).toContain('workout:read');
    expect(COMPANION_SCOPES).toContain('health:read');
    expect(COMPANION_SCOPES).toContain('chat:read');
    expect(COMPANION_SCOPES).toContain('offline_access');
  });

  it('formats scope string as space-separated tokens', () => {
    expect(COMPANION_SCOPE_STRING).toBe(COMPANION_SCOPES.join(' '));
    expect(COMPANION_SCOPE_STRING).toContain('profile:read profile:write workout:read');
  });
});
