/* Hallmark · genre: modern-minimal · design-system: docs/DESIGN.md · designed-as-app · pre-emit critique: P4 H4 E4 S4 R5 V4 */
import { useState } from 'react';
import { View } from 'react-native';
import Svg, { Polygon, Rect } from 'react-native-svg';

import {
  heightFractionFromIntensity,
  type StructureChartBlock,
} from '../structureIntensity';
import { Colors, zoneColor } from '@/src/theme/colors';

const PROFILE_HEIGHT = 56;
const MIN_BLOCK_WIDTH = 2;
const GAP = 1;
const LIST_HEIGHT = 28;

type Props = {
  blocks: StructureChartBlock[];
  height?: number;
  /** Compact list/teaser glance (shorter default). */
  compact?: boolean;
};

/**
 * Compact intensity silhouette for planned endurance structure.
 * Returns null when fewer than two steps have positive durations.
 */
export function StructureProfile({ blocks, height, compact = false }: Props) {
  const [width, setWidth] = useState(0);
  const chartHeight = height ?? (compact ? LIST_HEIGHT : PROFILE_HEIGHT);
  const timed = blocks.filter((b) => b.durationSec > 0);
  if (timed.length < 2) return null;

  const totalDuration = timed.reduce((sum, b) => sum + b.durationSec, 0);
  const gapsTotal = GAP * (timed.length - 1);
  const usable = Math.max(width - gapsTotal, timed.length * MIN_BLOCK_WIDTH);
  const flex = Math.max(0, usable - timed.length * MIN_BLOCK_WIDTH);

  let currentX = 0;
  const shapes: Array<
    | {
        kind: 'rect';
        key: string;
        x: number;
        y: number;
        width: number;
        height: number;
        fill: string;
      }
    | {
        kind: 'ramp';
        key: string;
        points: string;
        fill: string;
      }
  > = [];

  for (const block of timed) {
    const blockWidth = MIN_BLOCK_WIDTH + (block.durationSec / totalDuration) * flex;
    const color =
      block.zoneIndex != null ? zoneColor(block.zoneIndex) : Colors.zoneNeutral;

    if (block.ramp && block.intensity != null) {
      const startH = Math.max(heightFractionFromIntensity(block.ramp.start) * chartHeight, chartHeight * 0.1);
      const endH = Math.max(heightFractionFromIntensity(block.ramp.end) * chartHeight, chartHeight * 0.1);
      const x0 = currentX;
      const x1 = currentX + blockWidth;
      const yBase = chartHeight;
      const points = [
        `${x0},${yBase - startH}`,
        `${x1},${yBase - endH}`,
        `${x1},${yBase}`,
        `${x0},${yBase}`,
      ].join(' ');
      shapes.push({ kind: 'ramp', key: block.key, points, fill: color });
    } else {
      const fraction = heightFractionFromIntensity(block.intensity);
      const blockHeight = Math.max(fraction * chartHeight, chartHeight * 0.12);
      shapes.push({
        kind: 'rect',
        key: block.key,
        x: currentX,
        y: chartHeight - blockHeight,
        width: blockWidth,
        height: blockHeight,
        fill: color,
      });
    }
    currentX += blockWidth + GAP;
  }

  return (
    <View
      accessibilityRole="image"
      accessibilityLabel="Workout intensity profile"
      className={compact ? 'mt-1.5' : 'mt-3'}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      style={{ width: '100%', height: chartHeight, opacity: compact ? 0.75 : 1 }}
    >
      {width > 0 ? (
        <Svg width={width} height={chartHeight}>
          {shapes.map((s) =>
            s.kind === 'ramp' ? (
              <Polygon key={s.key} points={s.points} fill={s.fill} />
            ) : (
              <Rect
                key={s.key}
                x={s.x}
                y={s.y}
                width={s.width}
                height={s.height}
                fill={s.fill}
                rx={1}
              />
            )
          )}
        </Svg>
      ) : null}
    </View>
  );
}
