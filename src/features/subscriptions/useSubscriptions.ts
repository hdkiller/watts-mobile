import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { fetchSubscriptionSummary, reconcileSubscription } from './api';
import { fetchStorePackages } from './revenueCat';

export const SUBSCRIPTION_SUMMARY_KEY = ['subscription', 'summary'] as const;
export const SUBSCRIPTION_OFFERINGS_KEY = ['subscription', 'offerings'] as const;

export function useSubscriptionSummary() {
  return useQuery({ queryKey: SUBSCRIPTION_SUMMARY_KEY, queryFn: fetchSubscriptionSummary, staleTime: 15_000 });
}

export function useStoreOfferings(enabled: boolean) {
  return useQuery({ queryKey: SUBSCRIPTION_OFFERINGS_KEY, queryFn: fetchStorePackages, enabled, staleTime: 60_000 });
}

export function useReconcileSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reconcileSubscription,
    onSuccess: async (summary) => {
      queryClient.setQueryData(SUBSCRIPTION_SUMMARY_KEY, summary);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['today'] }),
        queryClient.invalidateQueries({ queryKey: ['profile'] }),
        queryClient.invalidateQueries({ queryKey: ['entitlements'] }),
      ]);
    },
  });
}
