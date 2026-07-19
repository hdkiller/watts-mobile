import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { fetchUserInfo, setAuthFailureHandler, type UserInfo } from '@/src/api/client';
import { friendlyError } from '@/src/api/errors';
import { applyE2eAuthSeed } from '@/src/auth/e2eAuth';
import { loginWithPkce } from '@/src/auth/oauth';
import { clearTokens, loadTokens } from '@/src/auth/tokenStorage';
import {
  getDefaultInstanceUrl,
  getInstanceUrl,
  setInstanceUrl,
  validateInstanceReachability,
} from '@/src/config/instance';
import { queryPersister, shouldPersistQuery } from '@/src/query/persist';

type AuthStatus = 'loading' | 'needs_instance' | 'needs_login' | 'authenticated';

type AuthContextValue = {
  status: AuthStatus;
  instanceUrl: string | null;
  user: UserInfo | null;
  error: string | null;
  defaultInstanceUrl: string;
  saveInstance: (url: string) => Promise<void>;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      // Keep cached Today/planned readable offline between launches.
      gcTime: 1000 * 60 * 60 * 24 * 7,
    },
  },
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [instanceUrl, setInstanceUrlState] = useState<string | null>(null);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const bootstrap = useCallback(async () => {
    setStatus('loading');
    try {
      const e2eSeed = await applyE2eAuthSeed();
      if (e2eSeed) {
        setInstanceUrlState(e2eSeed.instanceUrl);
        try {
          const info = await fetchUserInfo();
          setUser(info);
          setStatus('authenticated');
        } catch (err) {
          setUser(null);
          setError(friendlyError(err, 'E2E auth seed failed — check token and instance URL'));
          setStatus('needs_login');
        }
        return;
      }

      let storedInstance = await getInstanceUrl();
      if (!storedInstance) {
        const defaultUrl = getDefaultInstanceUrl();
        await setInstanceUrl(defaultUrl);
        storedInstance = defaultUrl;
      }
      setInstanceUrlState(storedInstance);

      const tokens = await loadTokens();
      if (!tokens?.accessToken) {
        setStatus('needs_login');
        return;
      }

      try {
        const info = await fetchUserInfo();
        setUser(info);
        setStatus('authenticated');
      } catch {
        setUser(null);
        setStatus('needs_login');
      }
    } catch (err) {
      setError(friendlyError(err, 'Failed to start app'));
      setStatus('needs_instance');
    }
  }, []);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  useEffect(() => {
    setAuthFailureHandler(() => {
      setUser(null);
      setStatus((current) => (current === 'needs_instance' ? current : 'needs_login'));
      void queryClient.clear();
    });
    return () => setAuthFailureHandler(null);
  }, []);

  const saveInstance = useCallback(async (url: string) => {
    setError(null);
    await validateInstanceReachability(url);
    const normalized = await setInstanceUrl(url);
    setInstanceUrlState(normalized);
    setStatus('needs_login');
  }, []);

  const signIn = useCallback(async () => {
    setError(null);
    const instance = instanceUrl ?? (await getInstanceUrl());
    if (!instance) {
      setStatus('needs_instance');
      throw new Error('Configure an instance URL first');
    }

    await validateInstanceReachability(instance);
    await loginWithPkce(instance);
    const info = await fetchUserInfo();
    setUser(info);
    setStatus('authenticated');
  }, [instanceUrl]);

  const signOut = useCallback(async () => {
    try {
      const { clearPushRegistrationOnSignOut } = await import(
        '@/src/features/notifications/pushRegistration'
      );
      await clearPushRegistrationOnSignOut();
    } catch (error) {
      console.warn('Failed to clear push registration on sign-out', error);
    }
    await clearTokens();
    setUser(null);
    queryClient.clear();
    setStatus(instanceUrl ? 'needs_login' : 'needs_instance');
  }, [instanceUrl]);

  const refreshUser = useCallback(async () => {
    const info = await fetchUserInfo();
    setUser(info);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      instanceUrl,
      user,
      error,
      defaultInstanceUrl: getDefaultInstanceUrl(),
      saveInstance,
      signIn,
      signOut,
      clearError: () => setError(null),
      refreshUser,
    }),
    [status, instanceUrl, user, error, saveInstance, signIn, signOut, refreshUser]
  );

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: queryPersister,
        maxAge: 1000 * 60 * 60 * 24 * 7,
        dehydrateOptions: {
          shouldDehydrateQuery: shouldPersistQuery,
        },
      }}
    >
      <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    </PersistQueryClientProvider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
