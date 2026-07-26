import { describe, expect, it } from 'vitest';

import {
  HELP_CENTER_URL,
  helpCenterWebPath,
  notificationsWebPath,
  PRIVACY_POLICY_URL,
  privacyWebPath,
  SUPPORT_URL,
  TERMS_OF_SERVICE_URL,
} from '../paths';

describe('account paths', () => {
  it('returns valid web paths for account actions', () => {
    expect(notificationsWebPath()).toBe('/notifications');
    expect(helpCenterWebPath()).toBe('/help-center');
    expect(privacyWebPath()).toBe('/privacy');
  });

  it('provides official legal and support URLs', () => {
    expect(PRIVACY_POLICY_URL).toBe('https://coachwatts.com/privacy');
    expect(TERMS_OF_SERVICE_URL).toBe('https://coachwatts.com/terms');
    expect(HELP_CENTER_URL).toBe('https://coachwatts.com/help-center');
    expect(SUPPORT_URL).toBe('mailto:support@coachwatts.com');
  });
});
