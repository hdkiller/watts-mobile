import { useQuery } from '@tanstack/react-query';

import { fetchMyReferral } from './api';

export const MY_REFERRAL_QUERY_KEY = ['referrals', 'me', 'mobile_qr'] as const;

export function useMyReferral(enabled = true) {
  return useQuery({
    queryKey: MY_REFERRAL_QUERY_KEY,
    queryFn: fetchMyReferral,
    enabled,
    staleTime: 60_000,
  });
}
