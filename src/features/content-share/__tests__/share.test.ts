import { describe, expect, it, vi, beforeEach } from 'vitest';
import { attributeShareUrl } from '../attribution';
import { generateShareToken } from '../api';

const { apiFetch } = vi.hoisted(() => ({ apiFetch: vi.fn() }));
vi.mock('@/src/api/client', () => ({ apiFetch }));

describe('content-share', () => {
  beforeEach(() => {
    apiFetch.mockReset();
  });

  describe('attributeShareUrl', () => {
    it('appends referral code via and UTM tags to share URL', () => {
      const result = attributeShareUrl({
        url: 'https://coachwatts.com/share/workouts/tok_123',
        viaCode: 'REF123',
        contentKind: 'WORKOUT',
      });

      const parsed = new URL(result);
      expect(parsed.searchParams.get('via')).toBe('REF123');
      expect(parsed.searchParams.get('utm_source')).toBe('in_app_share');
      expect(parsed.searchParams.get('utm_medium')).toBe('mobile_content_share');
      expect(parsed.searchParams.get('utm_campaign')).toBe('athlete_referral');
      expect(parsed.searchParams.get('utm_content')).toBe('workout');
    });

    it('handles PLANNED_WORKOUT content type', () => {
      const result = attributeShareUrl({
        url: 'https://coachwatts.com/share/planned/tok_456',
        contentKind: 'PLANNED_WORKOUT',
      });

      const parsed = new URL(result);
      expect(parsed.searchParams.get('via')).toBeNull();
      expect(parsed.searchParams.get('utm_content')).toBe('planned_workout');
    });

    it('returns raw URL gracefully if URL parsing fails', () => {
      expect(attributeShareUrl({ url: '' })).toBe('');
      expect(attributeShareUrl({ url: 'invalid-url' })).toBe('invalid-url');
    });
  });

  describe('generateShareToken API', () => {
    it('calls POST /api/share/generate with correct payload', async () => {
      const mockPayload = {
        token: 'tok_abc',
        url: 'https://coachwatts.com/share/workouts/tok_abc',
      };

      apiFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPayload,
      } as Response);

      const res = await generateShareToken({
        type: 'WORKOUT',
        id: 'act-999',
      });

      expect(apiFetch).toHaveBeenCalledTimes(1);
      expect(apiFetch).toHaveBeenCalledWith('/api/share/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: 'WORKOUT', id: 'act-999' }),
      });
      expect(res.token).toBe('tok_abc');
    });
  });
});
