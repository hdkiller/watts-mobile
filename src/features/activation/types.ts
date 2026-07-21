export type MobileActivationStepId =
  | 'consent'
  | 'goal'
  | 'plan'
  | 'insight'
  | 'connect'
  | 'done';

export type OnboardingStatusApi = {
  hasConsent?: boolean;
  hasPrimaryGoal?: boolean;
  hasActivePlan?: boolean;
  hasFirstInsight?: boolean;
  hasUsableData?: boolean;
  hasIntegration?: boolean;
  softActivated?: boolean;
  fullyActivated?: boolean;
  mobileActivationStep?: MobileActivationStepId;
  primaryGoalId?: string | null;
  activePlanId?: string | null;
  activationComplete?: boolean;
};

export type ActivationStatus = {
  /** Older instances without activation fields — do not force wizard. */
  supportsActivation: boolean;
  softActivated: boolean;
  fullyActivated: boolean;
  mobileActivationStep: MobileActivationStepId;
  primaryGoalId: string | null;
  activePlanId: string | null;
  hasUsableData: boolean;
};

export const ACTIVATION_STEP_HREF: Record<Exclude<MobileActivationStepId, 'done'>, string> = {
  consent: '/(activation)/consent',
  goal: '/(activation)/goal',
  plan: '/(activation)/plan',
  insight: '/(activation)/insight',
  connect: '/(activation)/connect',
};
