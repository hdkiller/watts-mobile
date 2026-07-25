/* Hallmark · genre: modern-minimal · design-system: docs/DESIGN.md · designed-as-app */
import { useState } from 'react';
import { Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { useThemeColors } from '@/src/theme/useThemeColors';

import type { EnergyWavePoint } from './mapNutritionStrategy';

type Props = {
  points: EnergyWavePoint[];
  height?: number;
};

/**
 * Phone-sized glycogen horizon. One series, minimal furniture.
 * Returns null when there is not enough shape to read.
 */
export function EnergyHorizonChart({ points, height = 96 }: Props) {
  const theme = useThemeColors();
  const [width, setWidth] = useState(0);

  if (points.length < 4) return null;

  const levels = points.map((p) => p.level);
  const min = Math.min(...levels);
  const max = Math.max(...levels);
  const span = Math.max(max - min, 1);
  const padY = 6;
  const usableH = Math.max(height - padY * 2, 1);

  let d = '';
  points.forEach((p, i) => {
    const x = points.length === 1 ? 0 : (i / (points.length - 1)) * Math.max(width, 1);
    const y = padY + (1 - (p.level - min) / span) * usableH;
    d += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
  });

  return (
    <View
      testID="nutrition-energy-horizon"
      className="w-full"
      style={{ height }}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      accessibilityRole="image"
      accessibilityLabel="Energy horizon chart"
    >
      {width > 0 ? (
        <Svg width={width} height={height}>
          <Path
            d={d}
            stroke={theme.brand}
            strokeWidth={2}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      ) : null}
      <View className="mt-1 flex-row justify-between">
        <Text className="text-[10px] text-text-muted">Yesterday</Text>
        <Text className="text-[10px] text-text-muted">+3 days</Text>
      </View>
    </View>
  );
}
