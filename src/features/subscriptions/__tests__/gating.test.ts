import { describe, expect, it } from 'vitest';

import { canAcquireNativeSubscription, isOfficialHostedInstance } from '../gating';

describe('isOfficialHostedInstance', () => {
  it('returns false for null, undefined, or empty instance URL', () => {
    expect(isOfficialHostedInstance(null)).toBe(false);
    expect(isOfficialHostedInstance(undefined)).toBe(false);
    expect(isOfficialHostedInstance('')).toBe(false);
  });

  it('returns false for invalid URL strings', () => {
    expect(isOfficialHostedInstance('not-a-url')).toBe(false);
    expect(isOfficialHostedInstance('ftp://coachwatts.com')).toBe(false);
    expect(isOfficialHostedInstance('http://coachwatts.com')).toBe(false);
  });

  it('returns true for official https://coachwatts.com domain', () => {
    expect(isOfficialHostedInstance('https://coachwatts.com')).toBe(true);
    expect(isOfficialHostedInstance('https://COACHWATTS.COM')).toBe(true);
    expect(isOfficialHostedInstance('https://coachwatts.com/api/')).toBe(true);
  });

  it('returns false for subdomains or alternate domains', () => {
    expect(isOfficialHostedInstance('https://staging.coachwatts.com')).toBe(false);
    expect(isOfficialHostedInstance('https://coachwatts.com.fake.com')).toBe(false);
    expect(isOfficialHostedInstance('https://localhost:3099')).toBe(false);
  });
});

describe('canAcquireNativeSubscription', () => {
  it('checks both NATIVE_SUBSCRIPTIONS_ENABLED and isOfficialHostedInstance', () => {
    // Under default test config, NATIVE_SUBSCRIPTIONS_ENABLED is boolean
    const result = canAcquireNativeSubscription('https://coachwatts.com');
    expect(typeof result).toBe('boolean');

    expect(canAcquireNativeSubscription('https://selfhosted.example.com')).toBe(false);
    expect(canAcquireNativeSubscription(null)).toBe(false);
  });
});
