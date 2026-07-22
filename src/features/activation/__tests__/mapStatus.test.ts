import { describe, expect, it } from 'vitest';

import { activationStepRank, mapOnboardingStatus, wizardRequired } from '../mapStatus';

describe('mapOnboardingStatus', () => {
  it('degrades open for older API payloads without activation fields', () => {
    const status = mapOnboardingStatus({ hasUsableData: true });
    expect(status.supportsActivation).toBe(false);
    expect(wizardRequired(status)).toBe(false);
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

describe('activationStepRank', () => {
  it('orders wizard steps for resume vs optimistic ahead checks', () => {
    expect(activationStepRank('consent')).toBeLessThan(activationStepRank('goal'));
    expect(activationStepRank('insight')).toBeLessThan(activationStepRank('connect'));
    expect(activationStepRank('index')).toBe(-1);
  });
});
