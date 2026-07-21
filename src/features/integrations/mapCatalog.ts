import { CURATED_PROVIDERS } from './providers';
import type {
  CuratedProviderRow,
  IntegrationStatusRow,
  IntegrationsStatusResponse,
  ProviderRowState,
} from './types';

function toIsoOrNull(value: string | Date | null | undefined): string | null {
  if (value == null) return null;
  if (value instanceof Date) {
    return Number.isFinite(value.getTime()) ? value.toISOString() : null;
  }
  const d = new Date(value);
  return Number.isFinite(d.getTime()) ? d.toISOString() : null;
}

function rowState(row: IntegrationStatusRow): ProviderRowState {
  if (row.syncStatus === 'FAILED' || (row.errorMessage && row.errorMessage.trim().length > 0)) {
    return 'error';
  }
  return 'connected';
}

/** Merge API status onto the curated catalog; ignore OAuth-app consent rows. */
export function mapCuratedProviderRows(
  response: IntegrationsStatusResponse | undefined
): CuratedProviderRow[] {
  const byProvider = new Map<string, IntegrationStatusRow>();
  for (const row of response?.integrations ?? []) {
    if (row.isOAuthApp) continue;
    if (!row.provider) continue;
    // First match wins; API typically has one row per provider.
    if (!byProvider.has(row.provider)) {
      byProvider.set(row.provider, row);
    }
  }

  return CURATED_PROVIDERS.map((def) => {
    const match = byProvider.get(def.key);
    if (!match) {
      return {
        key: def.key,
        label: def.label,
        state: 'not_connected' as const,
        lastSyncAt: null,
        errorMessage: null,
        syncStatus: null,
      };
    }
    return {
      key: def.key,
      label: def.label,
      state: rowState(match),
      lastSyncAt: toIsoOrNull(match.lastSyncAt),
      errorMessage: match.errorMessage?.trim() || null,
      syncStatus: match.syncStatus ?? null,
    };
  });
}

/** Count curated providers that have a Coach Watts integration (ok or error). */
export function countConnectedCurated(rows: CuratedProviderRow[]): number {
  return rows.filter((row) => row.state !== 'not_connected').length;
}

export function connectedAppsHubDetail(
  rows: CuratedProviderRow[] | undefined,
  opts: { isLoading: boolean; isError: boolean }
): string {
  if (opts.isLoading && !rows) return '—';
  if (opts.isError && !rows) return '—';
  const n = countConnectedCurated(rows ?? []);
  if (n === 0) return 'None connected';
  return `${n} connected`;
}
