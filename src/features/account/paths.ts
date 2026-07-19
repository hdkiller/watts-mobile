/** Web paths used by More / account glue (coach-wattz routes). */

export function notificationsWebPath(): string {
  return '/notifications';
}

export function privacyWebPath(): string {
  return '/privacy';
}

/**
 * Canonical marketing-site legal/support destinations (not instance-relative).
 * Empty string hides the corresponding More row so we never ship a dead link.
 * Confirmed live on coachwatts.com via coach-wattz `privacy.vue` / `terms.vue` / `support.vue`.
 */
export const PRIVACY_POLICY_URL = 'https://coachwatts.com/privacy';
export const TERMS_OF_SERVICE_URL = 'https://coachwatts.com/terms';
/** Opens via Linking when mailto:; web URLs open via expo-web-browser. */
export const SUPPORT_URL = 'mailto:support@coachwatts.com';
