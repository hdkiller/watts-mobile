import { useSegments } from 'expo-router';
import { useEffect } from 'react';

import { useAuth } from '@/src/auth/AuthContext';
import { clearPendingReturnPath } from '@/src/linking/pendingReturnPath';

/**
 * When already inside the authenticated shell, drop leftover pending paths
 * stored by `+native-intent` (warm links navigate via the rewritten href).
 * Post-login resume is handled by `AuthenticatedEntry` (consumes pending).
 */
export function useDeepLinkReturn() {
  const { status } = useAuth();
  const segments = useSegments();

  useEffect(() => {
    if (status !== 'authenticated') return;
    if (segments[0] !== '(app)') return;
    void clearPendingReturnPath();
  }, [status, segments]);
}
