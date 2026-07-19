import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
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
import { loginWithPkce } from '@/src/auth/oauth';
import { clearTokens, loadTokens } from '@/src/auth/tokenStorage';
import {
  getDefaultInstanceUrl,
  getInstanceUrl,
  setInstanceUrl,
  validateInstanceReachability,
} from '@/src/config/instance';
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
      const storedInstance = await getInstanceUrl();
      setInstanceUrlState(storedInstance);

      if (!storedInstance) {
        setStatus('needs_instance');
        return;
      }

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
      setError(err instanceof Error ? err.message : 'Failed to start app');
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
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    </QueryClientProvider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
