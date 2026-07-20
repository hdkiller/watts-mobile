import * as WebBrowser from 'expo-web-browser';

import { mintAppWebHandoff } from '@/src/features/account/handoffApi';
import { absoluteInstanceUrl } from '@/src/features/profile/mapProfile';

/**
 * Open an instance web path, preferring Bearer→cookie session handoff.
 * Falls back to the bare URL when mint fails so escape hatches stay usable.
 */
export async function openInstanceWeb(
  instanceUrl: string | null | undefined,
  path = '/'
): Promise<void> {
  if (!instanceUrl) return;

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const bareUrl = absoluteInstanceUrl(instanceUrl, normalizedPath);

  try {
    const { url } = await mintAppWebHandoff(normalizedPath);
    await WebBrowser.openBrowserAsync(url);
  } catch {
    await WebBrowser.openBrowserAsync(bareUrl);
  }
}
