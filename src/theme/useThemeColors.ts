import { useColorScheme } from 'react-native';

import { themeColors, type ThemeColors } from './colors';

/** Active semantic + accent palette for the current OS appearance. */
export function useThemeColors(): ThemeColors {
  return themeColors(useColorScheme());
}
