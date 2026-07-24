import { apiFetch } from '@/src/api/client';

import type { MyReferral } from './types';

function mapMyReferral(json: unknown): MyReferral {
  const raw = json && typeof json === 'object' ? (json as Record<string, unknown>) : {};
  const statsRaw =
    raw.stats && typeof raw.stats === 'object' ? (raw.stats as Record<string, unknown>) : {};
  const code = typeof raw.code === 'string' ? raw.code : '';
  const shareUrl = typeof raw.shareUrl === 'string' ? raw.shareUrl : '';
  const attributedCount =
    typeof statsRaw.attributedCount === 'number' && Number.isFinite(statsRaw.attributedCount)
      ? statsRaw.attributedCount
      : 0;

  if (!code || !shareUrl) {
    throw new Error('Invalid referral payload');
  }

  return {
    code,
    shareUrl,
    stats: { attributedCount },
  };
}

export async function fetchMyReferral(): Promise<MyReferral> {
  const response = await apiFetch('/api/referrals/me?medium=mobile_qr');
  if (!response.ok) {
    const err = new Error(`Failed to load referral link (${response.status})`) as Error & {
      status?: number;
    };
    err.status = response.status;
    throw err;
  }
  return mapMyReferral(await response.json());
}
