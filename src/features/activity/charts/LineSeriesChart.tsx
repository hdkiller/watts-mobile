import { useState } from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle, Line, Polyline } from 'react-native-svg';

import { useThemeColors } from '@/src/theme/useThemeColors';

import type { StreamSeries } from '../chartTypes';
import { formatChartMinutes } from '../mapCharts';

type Props = {
  series: StreamSeries[];
  durationSec: number;
  height?: number;
  /** Override right-side x-axis label (default: duration as mm:ss). */
  endXLabel?: string;
  startXLabel?: string;
  /** Hide the series legend for compact/inline embeds. */
  showLegend?: boolean;
  /** Hide the horizontal gridlines for compact/inline embeds. */
  showGrid?: boolean;
  /** Hide the x-axis start/end labels for compact/inline embeds. */
  showXLabels?: boolean;
  /** Override the default chart insets for compact/inline embeds. */
  insets?: { left?: number; right?: number; top?: number; bottom?: number };
};

export function LineSeriesChart({
  series,
  durationSec,
  height = 160,
  endXLabel,
  startXLabel = '0:00',
  showLegend = true,
  showGrid = true,
  showXLabels = true,
  insets,
}: Props) {
  const theme = useThemeColors();

  const [width, setWidth] = useState(0);
  if (series.length === 0) return null;

  const padL = insets?.left ?? 36;
  const padR = insets?.right ?? 8;
  const padT = insets?.top ?? 12;
  const padB = insets?.bottom ?? 22;
  const innerW = Math.max(width - padL - padR, 1);
  const innerH = height - padT - padB;

  let minY = Infinity;
  let maxY = -Infinity;
  let maxX = Math.max(durationSec, 1);
  for (const s of series) {
    for (const p of s.points) {
      minY = Math.min(minY, p.y);
      maxY = Math.max(maxY, p.y);
      maxX = Math.max(maxX, p.x);
    }
  }
  if (!Number.isFinite(minY) || !Number.isFinite(maxY)) return null;
  if (maxY <= minY) {
    maxY = minY + 1;
  }
  const yPad = (maxY - minY) * 0.08;
  minY -= yPad;
  maxY += yPad;

  const toX = (x: number) => padL + (x / maxX) * innerW;
  const toY = (y: number) => padT + (1 - (y - minY) / (maxY - minY)) * innerH;

  const yTicks = [maxY, (maxY + minY) / 2, minY];

  return (
    <View
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      style={{ width: '100%' }}
    >
      {width > 0 ? (
        <Svg width={width} height={height}>
          {showGrid
            ? yTicks.map((tick, i) => {
                const y = toY(tick);
                return (
                  <Line
                    key={`grid-${i}`}
                    x1={padL}
                    x2={width - padR}
                    y1={y}
                    y2={y}
                    stroke={theme.border}
                    strokeWidth={1}
                  />
                );
              })
            : null}
          {series.map((s) => {
            const points = s.points.map((p) => `${toX(p.x)},${toY(p.y)}`).join(' ');
            return (
              <Polyline
                key={s.key}
                points={points}
                fill="none"
                stroke={s.color}
                strokeWidth={2}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            );
          })}
          {series.map((s) => {
            const last = s.points[s.points.length - 1];
            if (!last) return null;
            return (
              <Circle
                key={`${s.key}-end`}
                cx={toX(last.x)}
                cy={toY(last.y)}
                r={3}
                fill={s.color}
              />
            );
          })}
        </Svg>
      ) : (
        <View style={{ height }} />
      )}

      {showXLabels ? (
        <View className="mt-1 flex-row justify-between px-1">
          <Text className="text-[10px] text-text-muted">{startXLabel}</Text>
          <Text className="text-[10px] text-text-muted">
            {endXLabel ?? formatChartMinutes(maxX)}
          </Text>
        </View>
      ) : null}

      {showLegend ? (
        <View className="mt-2 flex-row flex-wrap">
          {series.map((s) => (
            <View key={s.key} className="mb-1 mr-4 flex-row items-center">
              <View className="mr-1.5 h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
              <Text className="text-xs text-text-muted">
                {s.label} ({s.unit})
              </Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}
