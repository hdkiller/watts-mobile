import { beforeEach, describe, expect, it, vi } from 'vitest';

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

  it('degrades open when the endpoint is missing on older instances', async () => {
    apiFetch.mockResolvedValueOnce(new Response('{}', { status: 404 }));

    await expect(fetchActivationStatus('instance|user')).resolves.toMatchObject({
      supportsActivation: false,
    });
  });

  it('degrades open for payloads without activation fields', async () => {
    apiFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ hasUsableData: true }), { status: 200 })
    );

    await expect(fetchActivationStatus('instance|user')).resolves.toMatchObject({
      supportsActivation: false,
    });
  });
});
