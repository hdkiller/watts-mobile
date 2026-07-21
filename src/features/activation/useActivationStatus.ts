import { useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/src/auth/AuthContext';

import { fetchActivationStatus } from './api';
import { activationIdentity } from './connectLater';
import type { ActivationStatus } from './types';

export const activationStatusQueryKey = ['activation', 'onboarding-status'] as const;

export function useActivationStatus(enabled = true) {
  const { instanceUrl, user } = useAuth();
  const identity = activationIdentity(instanceUrl, user);
  return useQuery({
    queryKey: [...activationStatusQueryKey, identity],
    queryFn: () => fetchActivationStatus(identity),
    enabled: enabled && Boolean(identity),
    staleTime: 30_000,
  });
}

export function useInvalidateActivationStatus() {
  const client = useQueryClient();
  return () => client.invalidateQueries({ queryKey: activationStatusQueryKey });
}

export function activationHrefForStatus(status: ActivationStatus | undefined): string | null {
  if (!status || !status.supportsActivation) return null;
  if (status.mobileActivationStep === 'done') return null;
  const step = status.mobileActivationStep;
  if (step === 'consent') return '/(activation)/consent';
  if (step === 'goal') return '/(activation)/goal';
  if (step === 'plan') return '/(activation)/plan';
  if (step === 'insight') return '/(activation)/insight';
  if (step === 'connect') return '/(activation)/connect';
  return null;
}
