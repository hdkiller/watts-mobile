import { beforeEach, describe, expect, it, vi } from 'vitest';

import { mintAppWebHandoff } from '../handoffApi';

const { apiFetch } = vi.hoisted(() => ({ apiFetch: vi.fn() }));

vi.mock('@/src/api/client', () => ({ apiFetch }));

describe('handoffApi', () => {
  beforeEach(() => {
    apiFetch.mockReset();
  });

  it('mints an authenticated web handoff URL', async () => {
    apiFetch.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          url: 'https://coachwatts.com/api/auth/handoff?token=test-handoff-token&returnTo=%2Fsettings%2Fdanger',
          expiresIn: 300,
        }),
        { status: 200 },
      ),
    );

    const result = await mintAppWebHandoff('/settings/danger');

    expect(apiFetch).toHaveBeenCalledTimes(1);
    expect(apiFetch).toHaveBeenCalledWith('/api/auth/app-web-handoff', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ returnTo: '/settings/danger' }),
    });
    expect(result.url).toContain(encodeURIComponent('/settings/danger'));
    expect(result.expiresIn).toBe(300);
  });

  it('throws an error when handoff mint fails', async () => {
    apiFetch.mockResolvedValueOnce(new Response(null, { status: 401 }));

    await expect(mintAppWebHandoff('/settings/danger')).rejects.toThrow(
      'Handoff mint failed (401)',
    );
  });
});
