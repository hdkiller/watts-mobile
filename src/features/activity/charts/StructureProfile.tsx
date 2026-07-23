import { useState } from 'react';
import { View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';

import { stepIntensity } from '../mapActivity';
import type { PlannedStructureStep } from '../types';
import { Colors, zoneColor } from '@/src/theme/colors';

const PROFILE_HEIGHT = 56;
const MIN_BLOCK_WIDTH = 2;
const GAP = 1;
const NEUTRAL_FRACTION = 0.45;

type Props = {
  steps: PlannedStructureStep[];
  height?: number;
};

type TimedBlock = {
  key: string;
  durationSec: number;
  color: string;
  fraction: number;
};

function buildBlocks(steps: PlannedStructureStep[]): TimedBlock[] {
  const blocks: TimedBlock[] = [];
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i]!;
    const durationSec = step.durationSec;
    if (durationSec == null || durationSec <= 0) continue;

    const intensity = stepIntensity(step);
    let fraction = NEUTRAL_FRACTION;
    let color: string = Colors.zoneNeutral;

    if (intensity.fraction != null && Number.isFinite(intensity.fraction)) {
      fraction = Math.min(Math.max(intensity.fraction, 0.15), 1);
    } else if (intensity.zoneIndex != null) {
      fraction = Math.min(Math.max((intensity.zoneIndex + 1) / Colors.zones.length, 0.15), 1);
    }

    if (intensity.zoneIndex != null) {
      color = zoneColor(intensity.zoneIndex);
    }

    blocks.push({
      key: `${step.name}-${i}`,
      durationSec,
      color,
      fraction,
    });
  }
  return blocks;
}

/**
 * Compact intensity silhouette for planned structure.
 * Returns null when fewer than two steps have positive durations.
 */
export function StructureProfile({ steps, height = PROFILE_HEIGHT }: Props) {
  const [width, setWidth] = useState(0);
  const blocks = buildBlocks(steps);
  if (blocks.length < 2) return null;

  const totalDuration = blocks.reduce((sum, b) => sum + b.durationSec, 0);
  const gapsTotal = GAP * (blocks.length - 1);
  const usable = Math.max(width - gapsTotal, blocks.length * MIN_BLOCK_WIDTH);
  const flex = Math.max(0, usable - blocks.length * MIN_BLOCK_WIDTH);

  let currentX = 0;
  const rects = [];
  for (const block of blocks) {
    const blockWidth =
      MIN_BLOCK_WIDTH + (block.durationSec / totalDuration) * flex;
    const blockHeight = Math.max(block.fraction * height, height * 0.12);
    const y = height - blockHeight;
    rects.push({
      key: block.key,
      x: currentX,
      y,
      width: blockWidth,
      height: blockHeight,
      fill: block.color,
    });
    currentX += blockWidth + GAP;
  }

  return (
    <View
      accessibilityRole="image"
      accessibilityLabel="Workout intensity profile"
      className="mt-3"
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      style={{ width: '100%', height }}
    >
      {width > 0 ? (
        <Svg width={width} height={height}>
          {rects.map((r) => (
            <Rect
              key={r.key}
              x={r.x}
              y={r.y}
              width={r.width}
              height={r.height}
              fill={r.fill}
              rx={1}
            />
          ))}
        </Svg>
      ) : null}
    </View>
  );
}
