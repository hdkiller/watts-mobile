import NetInfo from '@react-native-community/netinfo';
import { focusManager, onlineManager } from '@tanstack/react-query';
import { AppState, Platform, type AppStateStatus } from 'react-native';

let wired = false;

/**
 * Wire TanStack Query to RN connectivity + foreground so
 * refetchOnReconnect / refetchOnWindowFocus work outside the browser.
 * Safe to call once from the app root.
 */
export function wireQueryConnectivity(): void {
  if (wired) return;
  wired = true;

  onlineManager.setEventListener((setOnline) => {
    return NetInfo.addEventListener((state) => {
      // null = unknown during first probe — stay optimistic so boot isn't paused.
      setOnline((state.isConnected ?? true) && state.isInternetReachable !== false);
    });
  });

  if (Platform.OS !== 'web') {
    const onAppStateChange = (status: AppStateStatus) => {
      focusManager.setFocused(status === 'active');
    };
    AppState.addEventListener('change', onAppStateChange);
    focusManager.setFocused(AppState.currentState === 'active');
  }
}
