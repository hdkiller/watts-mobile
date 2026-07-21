import type { ActivationStatus, MobileActivationStepId, OnboardingStatusApi } from './types';

const STEPS: MobileActivationStepId[] = [
  'consent',
  'goal',
  'plan',
  'insight',
  'connect',
  'done',
];

function isStep(value: unknown): value is MobileActivationStepId {
  return typeof value === 'string' && (STEPS as string[]).includes(value);
}

/** Map a capability-checked API payload. Callers must reject missing activation fields. */
export function mapOnboardingStatus(raw: OnboardingStatusApi | null | undefined): ActivationStatus {
  if (!raw || raw.mobileActivationStep === undefined) {
    throw new Error('Activation fields are missing from onboarding status');
  }

  const step = isStep(raw.mobileActivationStep) ? raw.mobileActivationStep : 'done';

  return {
    supportsActivation: true,
    softActivated: raw.softActivated === true,
    fullyActivated: raw.fullyActivated === true,
    mobileActivationStep: step,
    primaryGoalId: raw.primaryGoalId ?? null,
    activePlanId: raw.activePlanId ?? null,
    hasUsableData: raw.hasUsableData === true,
  };
}

/**
 * Force the wizard only until soft activation (goal+plan+insight).
 * Connect-last may remain pending — handled as Finish-setup on Today / optional connect screen.
 */
export function wizardRequired(status: ActivationStatus): boolean {
  return status.supportsActivation && !status.softActivated;
}
