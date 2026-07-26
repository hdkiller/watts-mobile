/* Hallmark · genre: modern-minimal · design-system: docs/DESIGN.md · designed-as-app */
import { useState } from 'react';
import { Text, View } from 'react-native';
import Svg, { Line, Path } from 'react-native-svg';

import { useThemeColors } from '@/src/theme/useThemeColors';

import { isHorizonLegible, type EnergyWavePoint } from './mapNutritionStrategy';

type Props = {
  points: EnergyWavePoint[];
  height?: number;
};

/**
 * Phone-sized glycogen horizon. One series, now-marker, min/max anchors.
 * Returns null when there is not enough shape to read.
 */
export function EnergyHorizonChart({ points, height = 96 }: Props) {
  const theme = useThemeColors();
  const [width, setWidth] = useState(0);

  if (!isHorizonLegible(points)) return null;

  // Most athletes log little or no food, so the curve is usually inferred from the plan rather
  // than measured. A solid line would present that inference as a record of what they ate.
  const measured = points.filter((p) => p.intakeProvenance === 'logged').length;
  const isMostlyAssumed = points.length > 0 && measured / points.length < 0.3;

  const levels = points.map((p) => p.level);
  const min = Math.min(...levels);
  const max = Math.max(...levels);
  const span = Math.max(max - min, 1);
  const padY = 8;
  const usableH = Math.max(height - padY * 2, 1);
  // Wave window is yesterday → +3 days; "now" sits ~1/4 along that span.
  const nowIndex = Math.round((points.length - 1) * 0.25);
  const nowX =
    points.length === 1 ? 0 : (nowIndex / (points.length - 1)) * Math.max(width, 1);

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
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      accessibilityRole="image"
      accessibilityLabel={`Energy horizon, glycogen from ${Math.round(min)} to ${Math.round(max)}${
        isMostlyAssumed ? ', assumed from your plan rather than logged food' : ''
      }`}
    >
      <View style={{ height }}>
        {width > 0 ? (
          <Svg width={width} height={height}>
            <Line
              x1={nowX}
              y1={padY}
              x2={nowX}
              y2={height - padY}
              stroke={theme.borderStrong}
              strokeWidth={1}
              strokeDasharray="3 3"
            />
            <Path
              d={d}
              stroke={theme.brand}
              strokeWidth={2}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={isMostlyAssumed ? '4 3' : undefined}
              opacity={isMostlyAssumed ? 0.75 : 1}
            />
          </Svg>
        ) : null}
      </View>
      <View className="mt-1.5 flex-row items-center justify-between">
        <Text className="text-xs text-text-muted">Yesterday</Text>
        <Text className="text-xs font-medium text-text-muted">Now</Text>
        <Text className="text-xs text-text-muted">+3 days</Text>
      </View>
      <View className="mt-0.5 flex-row items-center justify-between">
        <Text className="text-xs text-text-muted">Low {Math.round(min)}</Text>
        {isMostlyAssumed ? (
          <Text className="text-xs text-text-muted">Assumed from plan</Text>
        ) : null}
        <Text className="text-xs text-text-muted">High {Math.round(max)}</Text>
      </View>
    </View>
  );
}
