import { ActivityIndicator } from 'react-native';

import { useThemeColors } from '@/src/theme/useThemeColors';

/**
 * Brand-tinted loading spinner.
 *
 * Exists so a spinner picks up `brandOnSurface` per theme rather than the
 * invariant brand fill: #00DC82 on light #fafafa is 1.74:1, so a raw
 * `<ActivityIndicator color={Colors.brand} />` is nearly invisible in light
 * mode. Prefer this over hand-tinting ActivityIndicator.
 */
export function Spinner({
  size = 'small',
  className,
}: {
  size?: 'small' | 'large';
  className?: string;
}) {
  const theme = useThemeColors();
  return <ActivityIndicator size={size} color={theme.brandOnSurface} className={className} />;
}
