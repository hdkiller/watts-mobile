import { Linking } from 'react-native';

import type { SubscriptionProvider } from './types';

export const BILLING_SUPPORT_EMAIL = 'support@coachwatts.com';

/**
 * Store-owned management pages only.
 *
 * Coach Watts has no External Purchase Link entitlement, so the app must not
 * link out to any page where a subscription can be bought, upgraded or
 * re-started — web-billed subscriptions get explanatory text instead of a link.
 * Apple's and Google's own subscription screens are exempt: they are the store's
 * management surface, not an alternative purchasing mechanism.
 */
export function storeManagementUrl(
  provider: SubscriptionProvider,
  managementUrl: string | null,
): string | null {
  if (provider === 'APPLE') return managementUrl ?? 'https://apps.apple.com/account/subscriptions';
  if (provider === 'GOOGLE') {
    return managementUrl ?? 'https://play.google.com/store/account/subscriptions';
  }
  return null;
}

export type OpenLinkResult = { ok: true } | { ok: false; message: string };

/**
 * Opens an external link, returning copy the caller can surface. `mailto:` needs
 * its own message — telling someone to "visit mailto:…" is nonsense.
 */
export async function openExternalUrl(url: string): Promise<OpenLinkResult> {
  try {
    const supported = await Linking.canOpenURL(url);
    if (!supported) throw new Error('unsupported');
    await Linking.openURL(url);
    return { ok: true };
  } catch {
    return {
      ok: false,
      message: url.startsWith('mailto:')
        ? `No mail app is set up on this device. Email us at ${BILLING_SUPPORT_EMAIL}.`
        : `Could not open the link. Visit ${url} in your browser.`,
    };
  }
}
