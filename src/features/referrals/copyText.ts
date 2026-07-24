import { Share } from 'react-native';

/**
 * Prefer expo-clipboard when the native module is linked; fall back to the
 * system share sheet so Invite still works before a dev-client rebuild.
 */
export async function copyText(text: string): Promise<'clipboard' | 'share'> {
  try {
    // Dynamic require — static import crashes Metro when ExpoClipboard isn't in the binary.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Clipboard = require('expo-clipboard') as {
      setStringAsync?: (value: string) => Promise<void>;
    };
    if (typeof Clipboard.setStringAsync === 'function') {
      await Clipboard.setStringAsync(text);
      return 'clipboard';
    }
  } catch {
    // Native module missing or unavailable.
  }

  await Share.share({ message: text });
  return 'share';
}
