import { useSafeAreaInsets } from 'react-native-safe-area-context';

/** Approximate floating NativeTabs bar height above the home indicator. */
const TAB_BAR_CONTENT_HEIGHT = 64;

/**
 * Bottom padding for tab-root ScrollViews so content clears the floating tab bar.
 * Pass keyboard overlap (or other extras) as `extra`.
 */
export function useTabScrollPadding(extra = 0): number {
  const insets = useSafeAreaInsets();
  return TAB_BAR_CONTENT_HEIGHT + insets.bottom + extra;
}
