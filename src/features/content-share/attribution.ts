import type { AttributeShareOptions } from './types';

/**
 * Attributes a public share landing URL with referral tracking parameters and UTM tags.
 *
 * Parameters added:
 * - `via`: Referral code (if provided)
 * - `utm_source`: `in_app_share`
 * - `utm_medium`: `mobile_content_share`
 * - `utm_campaign`: `athlete_referral`
 * - `utm_content`: content type slug (e.g. `workout` or `planned_workout`)
 */
export function attributeShareUrl(options: AttributeShareOptions): string {
  const { url, viaCode, contentKind } = options;

  if (!url) return url;

  try {
    const parsed = new URL(url);

    if (viaCode && viaCode.trim().length > 0) {
      parsed.searchParams.set('via', viaCode.trim());
    }

    parsed.searchParams.set('utm_source', 'in_app_share');
    parsed.searchParams.set('utm_medium', 'mobile_content_share');
    parsed.searchParams.set('utm_campaign', 'athlete_referral');

    if (contentKind) {
      parsed.searchParams.set('utm_content', contentKind.toLowerCase());
    }

    return parsed.toString();
  } catch {
    // If URL parsing fails, return raw url
    return url;
  }
}
