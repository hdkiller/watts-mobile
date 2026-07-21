import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ApiError } from '@/src/api/errors';

import { fetchActivationStatus } from '../api';

const { apiFetch } = vi.hoisted(() => ({ apiFetch: vi.fn() }));

vi.mock('@/src/api/client', () => ({ apiFetch }));
vi.mock('../connectLater', () => ({ getConnectLater: vi.fn(async () => false) }));

describe('fetchActivationStatus', () => {
  beforeEach(() => apiFetch.mockReset());

  it('uses the normal authenticated refresh path', async () => {
    apiFetch.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          mobileActivationStep: 'goal',
          softActivated: false,
          fullyActivated: false,
        }),
        { status: 200 }
      )
    );

    await fetchActivationStatus('instance|user');

    expect(apiFetch).toHaveBeenCalledWith('/api/user/onboarding-status');
  });

  it('rejects unsupported instances instead of inventing completion', async () => {
    apiFetch.mockResolvedValueOnce(new Response('{}', { status: 404 }));

    await expect(fetchActivationStatus('instance|user')).rejects.toMatchObject({
      status: 404,
    } satisfies Partial<ApiError>);
  });

  it('rejects payloads without activation fields', async () => {
    apiFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ hasUsableData: true }), { status: 200 })
    );

    await expect(fetchActivationStatus('instance|user')).rejects.toMatchObject({
      status: 426,
    } satisfies Partial<ApiError>);
  });
});
