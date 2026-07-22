import { apiFetch } from '@/src/api/client';
import { ApiError } from '@/src/api/errors';

import { getConnectLater } from './connectLater';
import { mapOnboardingStatus, unsupportedActivationStatus } from './mapStatus';
import type { ActivationStatus, OnboardingStatusApi } from './types';

async function readErrorBody(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return undefined;
  }
}

export async function fetchActivationStatus(identity?: string | null): Promise<ActivationStatus> {
  const connectLater = await getConnectLater(identity);
  const qs = connectLater ? '?connectLater=1' : '';
  const response = await apiFetch(`/api/user/onboarding-status${qs}`);

  if (!response.ok) {
    // Older instances may lack the endpoint — open tabs instead of blocking the shell.
    if (response.status === 404) {
      return unsupportedActivationStatus();
    }
    const body = await readErrorBody(response);
    throw new ApiError(
      `Failed to load onboarding status (${response.status})`,
      response.status,
      body
    );
  }

  const json = (await response.json()) as OnboardingStatusApi;
  return mapOnboardingStatus(json);
}

export async function submitConsent(input: {
  termsVersion: string;
  privacyPolicyVersion: string;
}): Promise<void> {
  const response = await apiFetch('/api/user/consent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      termsVersion: input.termsVersion,
      privacyPolicyVersion: input.privacyPolicyVersion,
      healthConsentAccepted: true,
    }),
  });
  if (!response.ok) {
    const body = await readErrorBody(response);
    const message =
      typeof body === 'object' &&
      body !== null &&
      ('message' in body || 'statusMessage' in body)
        ? String(
            (body as { message?: string; statusMessage?: string }).message ||
              (body as { statusMessage?: string }).statusMessage ||
              `Consent failed (${response.status})`
          )
        : `Consent failed (${response.status})`;
    throw new ApiError(message, response.status, body);
  }
}

export async function markFirstInsightViewed(): Promise<void> {
  const response = await apiFetch('/api/user/onboarding/complete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ valueType: 'plan_week_reveal' }),
  });
  if (!response.ok && response.status !== 404) {
    const body = await readErrorBody(response);
    throw new ApiError(
      `Failed to mark first insight (${response.status})`,
      response.status,
      body
    );
  }
}

/** Policy versions must match coach-wattz `shared/policy-versions.ts`. */
export const POLICY_VERSIONS = {
  terms: '1.0',
  privacy: '1.0',
} as const;
