import { describe, expect, it } from 'vitest';

import { mergeActivationAdvance } from '../mapStatus';
import type { ActivationStatus } from '../types';

const base: ActivationStatus = {
  supportsActivation: true,
  softActivated: false,
  fullyActivated: false,
  mobileActivationStep: 'consent',
  primaryGoalId: null,
  activePlanId: null,
  hasUsableData: false,
};

describe('mergeActivationAdvance', () => {
  it('moves the step forward when the patch is ahead of cache', () => {
    expect(mergeActivationAdvance(base, { mobileActivationStep: 'goal' }).mobileActivationStep).toBe(
      'goal'
    );
  });

  it('does not regress when the server is already ahead of the patch', () => {
    const ahead = { ...base, mobileActivationStep: 'plan' as const };
    expect(mergeActivationAdvance(ahead, { mobileActivationStep: 'goal' }).mobileActivationStep).toBe(
      'plan'
    );
  });

  it('keeps soft activation once set even if a lagging refetch omits it', () => {
    const soft = { ...base, mobileActivationStep: 'connect' as const, softActivated: true };
    expect(mergeActivationAdvance(soft, { mobileActivationStep: 'connect' }).softActivated).toBe(
      true
    );
    expect(
      mergeActivationAdvance(
        { ...soft, softActivated: false },
        { softActivated: true, mobileActivationStep: 'connect' }
      ).softActivated
    ).toBe(true);
  });

  it('carries primaryGoalId forward so Plan does not wait on refetch', () => {
    const next = mergeActivationAdvance(base, {
      mobileActivationStep: 'plan',
      primaryGoalId: 'goal-123',
    });
    expect(next.mobileActivationStep).toBe('plan');
    expect(next.primaryGoalId).toBe('goal-123');
  });
});
