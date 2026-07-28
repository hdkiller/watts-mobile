import { useState } from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle, G, Line, Path, Polyline, Text as SvgText } from 'react-native-svg';

import { useThemeColors } from '@/src/theme/useThemeColors';

import type { StreamSeries } from '../chartTypes';
import { formatChartMinutes } from '../mapCharts';
import { bucketStreamEnvelope, niceThreeTickDomain } from '../streamEnvelope';

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

function accessibleDuration(seconds: number): string {
  const totalSeconds = Math.max(0, Math.round(seconds));
  const hours = Math.floor(totalSeconds / 3_600);
  const minutes = Math.floor((totalSeconds % 3_600) / 60);
  const remainder = totalSeconds % 60;
  return [
    hours > 0 ? `${hours} ${hours === 1 ? 'hour' : 'hours'}` : null,
    minutes > 0 ? `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}` : null,
    remainder > 0 || totalSeconds === 0
      ? `${remainder} ${remainder === 1 ? 'second' : 'seconds'}`
      : null,
  ]
    .filter(Boolean)
    .join(' ');
}

function accessibleSeriesSummary(series: StreamSeries): string {
  const values = series.points.map((point) => point.y).filter(Number.isFinite);
  if (values.length === 0) return `${series.label}, no data`;
  const minimum = Math.min(...values);
  const maximum = Math.max(...values);
  const average = values.reduce((total, value) => total + value, 0) / values.length;
  return `${series.label}, minimum ${Math.round(minimum)} ${series.unit}, maximum ${Math.round(maximum)} ${series.unit}, average ${Math.round(average)} ${series.unit}`;
}

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
  let maxX = Math.max(durationSec, 1);
  for (const s of series) {
    for (const p of s.points) {
      maxX = Math.max(maxX, p.x);
    }
  }
  const groups = series.reduce<{ key: string; series: StreamSeries[] }[]>((panels, item) => {
    const key = item.scaleGroup ?? item.unit;
    const existing = panels.find((panel) => panel.key === key);
    if (existing) existing.series.push(item);
    else panels.push({ key, series: [item] });
    return panels;
  }, []);
  const panelHeight = groups.length > 1 ? Math.min(height, 112) : height;

  return (
    <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)} style={{ width: '100%' }}>
      {width > 0 ? (
        groups.map((group, groupIndex) => {
          const innerH = panelHeight - padT - padB;
          const envelopes = group.series.map((item) => ({
            item,
            points: bucketStreamEnvelope(item.points, innerW, 0, maxX),
          }));
          let minY = Infinity;
          let maxY = -Infinity;
          for (const envelope of envelopes) {
            for (const point of envelope.points) {
              minY = Math.min(minY, point.min);
              maxY = Math.max(maxY, point.max);
            }
          }
          if (!Number.isFinite(minY) || !Number.isFinite(maxY)) return null;
          const [domainMin, domainMid, domainMax] = niceThreeTickDomain(minY, maxY);
          const yTicks = [domainMax, domainMid, domainMin];
          const toX = (x: number) => padL + (x / maxX) * innerW;
          const toY = (y: number) =>
            padT + (1 - (y - domainMin) / (domainMax - domainMin)) * innerH;
          const accessibilityLabel = `${group.series
            .map(accessibleSeriesSummary)
            .join('. ')}. Duration ${accessibleDuration(maxX)}`;

          return (
            <View
              key={group.key}
              className={groupIndex > 0 ? 'mt-2' : undefined}
              accessible
              accessibilityRole="image"
              accessibilityLabel={accessibilityLabel}
            >
              <Svg width={width} height={panelHeight}>
                {showGrid
                  ? yTicks.map((tick, index) => {
                      const y = toY(tick);
                      return (
                        <Line
                          key={`grid-${index}`}
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
                {showGrid
                  ? yTicks.map((tick, index) => (
                      <SvgText
                        key={`label-${index}`}
                        x={padL - 6}
                        y={toY(tick) + 3.5}
                        fill={theme.textBody}
                        fontSize={10}
                        textAnchor="end"
                      >
                        {Math.round(tick)}
                      </SvgText>
                    ))
                  : null}
                {envelopes.map(({ item, points }) => {
                  if (points.length === 0) return null;
                  const upper = points.map((point) => `${toX(point.x)},${toY(point.max)}`);
                  const lower = points
                    .slice()
                    .reverse()
                    .map((point) => `${toX(point.x)},${toY(point.min)}`);
                  const band = `M${[...upper, ...lower].join(' L')} Z`;
                  const mean = points
                    .map((point) => `${toX(point.x)},${toY(point.mean)}`)
                    .join(' ');
                  const last = item.points[item.points.length - 1];
                  return (
                    <G key={item.key}>
                      <Path d={band} fill={item.color} fillOpacity={0.1} />
                      <Polyline
                        points={mean}
                        fill="none"
                        stroke={item.color}
                        strokeWidth={2}
                        strokeLinejoin="round"
                        strokeLinecap="round"
                      />
                      {last ? (
                        <Circle cx={toX(last.x)} cy={toY(last.y)} r={3} fill={item.color} />
                      ) : null}
                    </G>
                  );
                })}
              </Svg>
            </View>
          );
        })
      ) : (
        <View style={{ height: groups.length > 1 ? panelHeight * groups.length : panelHeight }} />
      )}

      {showXLabels ? (
        <View className="mt-1 flex-row justify-between px-1">
          <Text className="text-[10px] text-text-body">{startXLabel}</Text>
          <Text className="text-[10px] text-text-body">
            {endXLabel ?? formatChartMinutes(maxX)}
          </Text>
        </View>
      ) : null}

      {showLegend ? (
        <View className="mt-2 flex-row flex-wrap">
          {series.map((s) => (
            <View key={s.key} className="mb-1 mr-4 flex-row items-center">
              <View className="mr-1.5 h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
              <Text className="text-xs text-text-body">
                {s.label} ({s.unit})
              </Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}
