/** Raw row from GET /api/integrations/status (provider integrations + OAuth-app consents). */
export type IntegrationStatusRow = {
  id: string;
  provider: string;
  lastSyncAt?: string | Date | null;
  syncStatus?: string | null;
  externalUserId?: string | null;
  ingestWorkouts?: boolean;
  errorMessage?: string | null;
  settings?: unknown;
  /** Third-party OAuth app consent rows — ignored by Connected Apps lite. */
  isOAuthApp?: boolean;
  logoUrl?: string | null;
  scopes?: string[];
};

export type IntegrationsStatusResponse = {
  integrations: IntegrationStatusRow[];
};

export type CuratedProviderKey =
  | 'garmin'
  | 'whoop'
  | 'oura'
  | 'strava'
  | 'intervals'
  | 'polar'
  | 'wahoo'
  | 'fitbit'
  | 'withings';

export type ProviderRowState = 'not_connected' | 'connected' | 'error';

export type CuratedProviderRow = {
  key: CuratedProviderKey;
  label: string;
  state: ProviderRowState;
  lastSyncAt: string | null;
  errorMessage: string | null;
  syncStatus: string | null;
};
