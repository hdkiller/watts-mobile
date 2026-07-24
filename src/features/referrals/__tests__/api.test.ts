import { beforeEach, describe, expect, it, vi } from 'vitest';

const { apiFetch } = vi.hoisted(() => ({ apiFetch: vi.fn() }));

vi.mock('@/src/api/client', () => ({ apiFetch }));

import { fetchMyReferral } from '../api';

describe('fetchMyReferral', () => {
  beforeEach(() => {
    apiFetch.mockReset();
  });

  it('maps referral payload', async () => {
    apiFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        code: 'ABCDEFGHJK',
        shareUrl: 'https://coachwatts.com/join?via=ABCDEFGHJK&utm_medium=mobile_qr',
        stats: { attributedCount: 2 },
      }),
    });

    await expect(fetchMyReferral()).resolves.toEqual({
      code: 'ABCDEFGHJK',
      shareUrl: 'https://coachwatts.com/join?via=ABCDEFGHJK&utm_medium=mobile_qr',
      stats: { attributedCount: 2 },
    });
    expect(apiFetch).toHaveBeenCalledWith('/api/referrals/me?medium=mobile_qr');
  });
});
