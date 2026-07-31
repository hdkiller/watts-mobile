import { describe, expect, it } from 'vitest';

import {
  activationStepRank,
  canDismissActivationError,
  mapOnboardingStatus,
  wizardRequired,
} from '../mapStatus';
import { ACTIVATION_STEP_HREF } from '../types';

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

  it('routes an unknown/future mobileActivationStep into the wizard instead of bypassing it', () => {
    const status = mapOnboardingStatus({
      // Cast: simulating an unrecognized value the API might send in the future.
      mobileActivationStep: 'future-step' as never,
      softActivated: false,
      fullyActivated: false,
    });
    expect(status.supportsActivation).toBe(true);
    expect(status.mobileActivationStep).not.toBe('done');
    expect(wizardRequired(status)).toBe(true);
    // The core regression: wizardRequired() being true must not be paired with
    // a step that activationHrefForStatus() (useActivationStatus.ts) cannot
    // resolve to a route, or ActivationGate falls through and renders children.
    expect(status.mobileActivationStep in ACTIVATION_STEP_HREF).toBe(true);
  });
});

describe('activationStepRank', () => {
  it('orders wizard steps for resume vs optimistic ahead checks', () => {
    expect(activationStepRank('consent')).toBeLessThan(activationStepRank('goal'));
    expect(activationStepRank('insight')).toBeLessThan(activationStepRank('connect'));
    expect(activationStepRank('index')).toBe(-1);
  });
});

describe('canDismissActivationError', () => {
  it('blocks when there is no cached status at all', () => {
    expect(canDismissActivationError(undefined)).toBe(false);
  });

  it('blocks athletes still mid-wizard (not soft-activated, instance supports activation)', () => {
    const status = mapOnboardingStatus({
      mobileActivationStep: 'goal',
      softActivated: false,
      fullyActivated: false,
    });
    expect(canDismissActivationError(status)).toBe(false);
  });

  it('allows dismiss for soft-activated / connect-only athletes', () => {
    const status = mapOnboardingStatus({
      mobileActivationStep: 'connect',
      softActivated: true,
      fullyActivated: false,
    });
    expect(canDismissActivationError(status)).toBe(true);
  });

  it('allows dismiss for older instances that do not support activation', () => {
    const status = mapOnboardingStatus({ hasUsableData: true });
    expect(canDismissActivationError(status)).toBe(true);
  });
});
