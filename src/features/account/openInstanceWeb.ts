import * as WebBrowser from 'expo-web-browser';

import { mintAppWebHandoff } from '@/src/features/account/handoffApi';
import { absoluteInstanceUrl } from '@/src/features/profile/mapProfile';

/**
 * Open an instance web path, preferring Bearer→cookie session handoff.
 * Falls back to the bare URL when mint fails so escape hatches stay usable.
 *
 * Returns `false` (without opening anything) when `instanceUrl` is missing, so
 * callers that need to surface that failure to the user can check the result
 * instead of failing silently. Callers that don't care can keep firing this
 * off with `void`.
 */
export async function openInstanceWeb(
  instanceUrl: string | null | undefined,
  path = '/',
): Promise<boolean> {
  if (!instanceUrl) return false;

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const bareUrl = absoluteInstanceUrl(instanceUrl, normalizedPath);

  try {
    const { url } = await mintAppWebHandoff(normalizedPath);
    if (new URL(url).origin !== new URL(bareUrl).origin) {
      await WebBrowser.openBrowserAsync(bareUrl);
      return true;
    }
    await WebBrowser.openBrowserAsync(url);
  } catch {
    await WebBrowser.openBrowserAsync(bareUrl);
  }
  return true;
}
