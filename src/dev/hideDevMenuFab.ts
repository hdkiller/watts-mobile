import { requireOptionalNativeModule } from 'expo';

/**
 * Hide the expo-dev-client floating Tools FAB.
 * It sits over Log CTAs (e.g. wellness Check in) and steals Maestro taps,
 * opening the Dev Menu instead of the intended control.
 */
export function hideDevMenuFab(): void {
  if (!__DEV__) return;
  try {
    const prefs = requireOptionalNativeModule('DevMenuPreferences') as {
      setPreferencesAsync?: (value: { showFloatingActionButton?: boolean }) => Promise<void>;
    } | null;
    void prefs?.setPreferencesAsync?.({ showFloatingActionButton: false });
  } catch {
    /* optional native module — ignore on stock builds */
  }
}
