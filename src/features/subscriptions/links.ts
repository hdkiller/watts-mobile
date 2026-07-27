import { Linking } from 'react-native';

import type { SubscriptionProvider } from './types';

export const BILLING_SUPPORT_EMAIL = 'support@coachwatts.com';

export function webBillingUrl(instanceUrl: string | null | undefined): string {
  return `${(instanceUrl || 'https://coachwatts.com').replace(/\/$/, '')}/profile/settings?tab=billing`;
}

export function providerManagementUrl(
  provider: SubscriptionProvider,
  managementUrl: string | null,
  instanceUrl: string | null | undefined,
): string {
  if (managementUrl) return managementUrl;
  if (provider === 'APPLE') return 'https://apps.apple.com/account/subscriptions';
  if (provider === 'GOOGLE') return 'https://play.google.com/store/account/subscriptions';
  return webBillingUrl(instanceUrl);
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
