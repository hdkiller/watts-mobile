import { NATIVE_SUBSCRIPTIONS_ENABLED } from '@/src/config/env';

export function isOfficialHostedInstance(instanceUrl: string | null | undefined): boolean {
  if (!instanceUrl) return false;
  try {
    const url = new URL(instanceUrl);
    return url.protocol === 'https:' && url.hostname.toLowerCase() === 'coachwatts.com';
  } catch {
    return false;
  }
}

export function canAcquireNativeSubscription(instanceUrl: string | null | undefined): boolean {
  return NATIVE_SUBSCRIPTIONS_ENABLED && isOfficialHostedInstance(instanceUrl);
}
