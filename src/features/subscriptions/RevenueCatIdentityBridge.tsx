import { useEffect } from 'react';

import { useAuth } from '@/src/auth/AuthContext';

import { canAcquireNativeSubscription } from './gating';
import { identityForSession } from './adapters';
import { synchronizeRevenueCatIdentity } from './revenueCat';

export function RevenueCatIdentityBridge() {
  const { instanceUrl, status, user } = useAuth();

  useEffect(() => {
    const userId = identityForSession({
      authenticated: status === 'authenticated',
      hostedAcquisitionEnabled: canAcquireNativeSubscription(instanceUrl),
      userId: user?.sub,
    });
    void synchronizeRevenueCatIdentity(userId);
  }, [instanceUrl, status, user?.sub]);

  return null;
}
