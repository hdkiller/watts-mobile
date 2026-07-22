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

/** Older / unsupported instances — open the tab shell; do not force the wizard. */
export function unsupportedActivationStatus(): ActivationStatus {
  return {
    supportsActivation: false,
    softActivated: false,
    fullyActivated: false,
    mobileActivationStep: 'done',
    primaryGoalId: null,
    activePlanId: null,
    hasUsableData: false,
  };
}

/** Map onboarding-status payload. Missing activation fields degrade open (no wizard). */
export function mapOnboardingStatus(raw: OnboardingStatusApi | null | undefined): ActivationStatus {
  if (!raw || raw.mobileActivationStep === undefined) {
    return unsupportedActivationStatus();
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

/** Wizard step order for comparing optimistic forward navigation vs server resume. */
export function activationStepRank(step: string | undefined | null): number {
  if (!step) return -1;
  return STEPS.indexOf(step as MobileActivationStepId);
}

/** Merge an optimistic wizard advance without regressing past a newer server step. */
export function mergeActivationAdvance(
  prev: ActivationStatus,
  patch: Partial<ActivationStatus>
): ActivationStatus {
  const patchedStep = patch.mobileActivationStep;
  const step =
    patchedStep && activationStepRank(patchedStep) > activationStepRank(prev.mobileActivationStep)
      ? patchedStep
      : prev.mobileActivationStep;

  return {
    ...prev,
    ...patch,
    mobileActivationStep: step,
    softActivated: prev.softActivated || patch.softActivated === true,
    fullyActivated: prev.fullyActivated || patch.fullyActivated === true,
    primaryGoalId: patch.primaryGoalId !== undefined ? patch.primaryGoalId : prev.primaryGoalId,
    activePlanId: patch.activePlanId !== undefined ? patch.activePlanId : prev.activePlanId,
  };
}
