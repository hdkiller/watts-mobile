import { describe, expect, it } from 'vitest';

import {
  connectedAppsHubDetail,
  countConnectedCurated,
  mapCuratedProviderRows,
} from '../mapCatalog';
import type { IntegrationsStatusResponse } from '../types';

describe('mapCuratedProviderRows', () => {
  it('lists all curated providers as not connected when API is empty', () => {
    const rows = mapCuratedProviderRows({ integrations: [] });
    expect(rows).toHaveLength(9);
    expect(rows.every((r) => r.state === 'not_connected')).toBe(true);
    expect(rows.map((r) => r.key)).toContain('garmin');
    expect(rows.map((r) => r.key)).toContain('intervals');
  });

  it('maps SUCCESS to connected with last sync', () => {
    const response: IntegrationsStatusResponse = {
      integrations: [
        {
          id: '1',
          provider: 'garmin',
          syncStatus: 'SUCCESS',
          lastSyncAt: '2026-07-20T12:00:00.000Z',
          errorMessage: null,
        },
      ],
    };
    const garmin = mapCuratedProviderRows(response).find((r) => r.key === 'garmin');
    expect(garmin).toMatchObject({
      state: 'connected',
      lastSyncAt: '2026-07-20T12:00:00.000Z',
    });
  });

  it('maps FAILED / errorMessage to error', () => {
    const response: IntegrationsStatusResponse = {
      integrations: [
        {
          id: '1',
          provider: 'oura',
          syncStatus: 'FAILED',
          errorMessage: 'Token expired',
        },
        {
          id: '2',
          provider: 'whoop',
          syncStatus: 'SUCCESS',
          errorMessage: 'Needs reconnect',
        },
      ],
    };
    const rows = mapCuratedProviderRows(response);
    expect(rows.find((r) => r.key === 'oura')?.state).toBe('error');
    expect(rows.find((r) => r.key === 'whoop')?.state).toBe('error');
  });

  it('ignores OAuth-app consent rows', () => {
    const response: IntegrationsStatusResponse = {
      integrations: [
        {
          id: 'oauth-1',
          provider: 'strava',
          isOAuthApp: true,
          syncStatus: 'AUTHORIZED',
        },
      ],
    };
    expect(mapCuratedProviderRows(response).find((r) => r.key === 'strava')?.state).toBe(
      'not_connected'
    );
  });
});

describe('connectedAppsHubDetail', () => {
  it('returns em dash while loading or errored without data', () => {
    expect(connectedAppsHubDetail(undefined, { isLoading: true, isError: false })).toBe('—');
    expect(connectedAppsHubDetail(undefined, { isLoading: false, isError: true })).toBe('—');
  });

  it('summarizes connected count', () => {
    const rows = mapCuratedProviderRows({
      integrations: [
        { id: '1', provider: 'garmin', syncStatus: 'SUCCESS' },
        { id: '2', provider: 'oura', syncStatus: 'FAILED', errorMessage: 'x' },
      ],
    });
    expect(countConnectedCurated(rows)).toBe(2);
    expect(connectedAppsHubDetail(rows, { isLoading: false, isError: false })).toBe(
      '2 connected'
    );
    expect(
      connectedAppsHubDetail(mapCuratedProviderRows({ integrations: [] }), {
        isLoading: false,
        isError: false,
      })
    ).toBe('None connected');
  });
});
