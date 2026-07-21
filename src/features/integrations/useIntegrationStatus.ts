import { useQuery } from '@tanstack/react-query';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect } from 'react';
import { AppState } from 'react-native';

import { ApiError } from '@/src/api/errors';

import { fetchIntegrationStatus } from './api';
import { countConnectedCurated, mapCuratedProviderRows } from './mapCatalog';

export const INTEGRATIONS_STATUS_KEY = ['integrations', 'status'] as const;

function isTerminalStatusError(error: unknown): boolean {
  if (!(error instanceof ApiError)) return false;
  return error.status === 401 || error.status === 403 || error.status === 404;
}

/**
 * Integration status for Connected Apps lite.
 * staleTime 0 + focus/AppState refetch so return-from-browser updates rows.
 */
export function useIntegrationStatus() {
  const query = useQuery({
    queryKey: INTEGRATIONS_STATUS_KEY,
    queryFn: fetchIntegrationStatus,
    staleTime: 0,
    refetchOnMount: 'always',
    retry: (count, error) => {
      if (isTerminalStatusError(error)) return false;
      return count < 1;
    },
  });

  const refetch = query.refetch;

  useFocusEffect(
    useCallback(() => {
      void refetch();
    }, [refetch])
  );

  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      if (next === 'active') {
        void refetch();
      }
    });
    return () => sub.remove();
  }, [refetch]);

  const rows = query.data ? mapCuratedProviderRows(query.data) : undefined;
  const connectedCount = rows ? countConnectedCurated(rows) : 0;

  return {
    ...query,
    rows,
    connectedCount,
  };
}
