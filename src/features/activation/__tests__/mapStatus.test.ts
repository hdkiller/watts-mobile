import { describe, expect, it } from 'vitest';

import { mapOnboardingStatus, wizardRequired } from '../mapStatus';

describe('mapOnboardingStatus', () => {
  it('does not invent activation completion for older API payloads', () => {
    expect(() => mapOnboardingStatus({ hasUsableData: true })).toThrow(
      'Activation fields are missing'
    );
  });

  it('requires wizard when soft activation is incomplete', () => {
    const status = mapOnboardingStatus({
      mobileActivationStep: 'goal',
      softActivated: false,
      fullyActivated: false,
    });
    expect(status.supportsActivation).toBe(true);
    expect(wizardRequired(status)).toBe(true);
  });

  it('allows tabs when soft-activated even if connect remains', () => {
    const status = mapOnboardingStatus({
      mobileActivationStep: 'connect',
      softActivated: true,
      fullyActivated: false,
    });
    expect(wizardRequired(status)).toBe(false);
  });
});
