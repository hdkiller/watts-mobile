/* Hallmark · genre: modern-minimal · design-system: docs/DESIGN.md · designed-as-app
 * pre-emit critique: P5 H4 E4 S4 R5 V4 — type strip only; Season eyebrow; Today legend
 */
import { ScrollView, Text, View } from 'react-native';

import { AnimatedPressable } from '@/src/components/AnimatedPressable';
import { hapticLight } from '@/src/lib/haptics';
import { blockTypeColor } from '@/src/theme/colors';

import {
  formatVolumeHours,
  humanizeBlockType,
  timelineBlockLabels,
} from './formatPlanCopy';
import type { PlanBlockShell, PlanWeekShell } from './types';

const MIN_PHASE_WIDTH = 48;

type TimelineProps = {
  blocks: PlanBlockShell[];
  /** Block that owns the week currently shown. */
  selectedBlockId: string | null;
  /** 0–100 position of “today” within the season, or null to hide the needle. */
  todayPercent: number | null;
  onSelectBlock: (blockId: string) => void;
};

export function SeasonTimeline({
  blocks,
  selectedBlockId,
  todayPercent,
  onSelectBlock,
}: TimelineProps) {
  if (blocks.length === 0) return null;

  const totalWeeks = blocks.reduce((sum, b) => sum + Math.max(1, b.durationWeeks), 0);
  const scrollDense = blocks.length > 6 || totalWeeks > 24;
  // Only label “Today” when the needle is actually drawable inside the season.
  const showToday =
    todayPercent != null &&
    todayPercent > 0 &&
    todayPercent < 100 &&
    !scrollDense;
  const labels = timelineBlockLabels(blocks);

  return (
    <View
      testID="plan-season-timeline"
      className="gap-2"
      accessibilityLabel={`Season, ${totalWeeks} week${totalWeeks === 1 ? '' : 's'}`}
    >
      <View className="flex-row items-baseline justify-between">
        <Text className="text-xs font-semibold uppercase tracking-widest text-text-muted">
          Season
        </Text>
        <Text className="text-xs text-text-muted">
          {totalWeeks} week{totalWeeks === 1 ? '' : 's'}
          {showToday ? ' · Today' : ''}
        </Text>
      </View>

      <View className="relative overflow-hidden rounded-xl border border-border bg-card/80">
        {scrollDense ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="flex-row"
          >
            {blocks.map((block) => (
              <PhaseSegment
                key={block.id}
                block={block}
                label={labels.get(block.id) ?? block.name}
                selected={block.id === selectedBlockId}
                width={Math.max(MIN_PHASE_WIDTH, Math.max(1, block.durationWeeks) * 36)}
                onPress={() => onSelectBlock(block.id)}
              />
            ))}
          </ScrollView>
        ) : (
          <View className="h-12 flex-row">
            {blocks.map((block) => (
              <PhaseSegment
                key={block.id}
                block={block}
                label={labels.get(block.id) ?? block.name}
                selected={block.id === selectedBlockId}
                flex={Math.max(1, block.durationWeeks)}
                onPress={() => onSelectBlock(block.id)}
              />
            ))}
          </View>
        )}

        {showToday ? (
          <View
            pointerEvents="none"
            className="absolute bottom-0 top-0 w-0.5 bg-recovery"
            style={{ left: `${todayPercent}%` }}
            accessibilityElementsHidden
          />
        ) : null}
      </View>
    </View>
  );
}

function PhaseSegment({
  block,
  label,
  selected,
  flex,
  width,
  onPress,
}: {
  block: PlanBlockShell;
  label: string;
  selected: boolean;
  flex?: number;
  width?: number;
  onPress: () => void;
}) {
  const accent = blockTypeColor(block.type);
  const weeks = Math.max(1, block.durationWeeks);

  return (
    <AnimatedPressable
      testID={`plan-timeline-block-${block.id}`}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={`${block.name}, ${humanizeBlockType(block.type) ?? block.type}, ${weeks} weeks`}
      hitSlop={8}
      onPress={() => {
        hapticLight();
        onPress();
      }}
      style={{
        ...(flex != null ? { flex, minWidth: MIN_PHASE_WIDTH } : {}),
        ...(width != null ? { width, height: 48 } : {}),
      }}
      className={`justify-between border-r border-border/60 px-2 py-1.5 ${
        selected ? 'bg-brand/10' : ''
      }`}
    >
      <View>
        <Text
          className={`text-xs font-semibold ${
            selected ? 'text-text-primary' : 'text-text-muted'
          }`}
          numberOfLines={1}
        >
          {label}
        </Text>
        <Text className="text-xs text-text-muted">{weeks}w</Text>
      </View>
      <View
        className="mt-1 rounded-full"
        style={{
          backgroundColor: accent,
          opacity: selected ? 1 : 0.65,
          height: selected ? 4 : 3,
        }}
      />
    </AnimatedPressable>
  );
}

type WeekStatsProps = {
  week: PlanWeekShell | null;
  block: PlanBlockShell | null;
};

/** Compact FOCUS · VOLUME · TSS · TYPE metadata line (not a tile grid). */
export function WeekTargetStats({ week, block }: WeekStatsProps) {
  if (!week) return null;

  const focus = week.focusLabel?.trim() || block?.primaryFocus?.trim() || null;
  const volume = formatVolumeHours(week.volumeTargetMinutes);
  const tss = week.tssTarget != null ? `TSS ${Math.round(week.tssTarget)}` : null;
  const typeLabel = week.isRecovery ? 'Recovery' : 'Training';
  const parts = [focus, volume, tss, typeLabel].filter(Boolean);

  if (parts.length === 0) return null;

  return (
    <Text
      testID="plan-week-stats"
      className={`text-sm ${week.isRecovery ? 'text-recovery' : 'text-text-muted'}`}
    >
      {parts.join(' · ')}
    </Text>
  );
}
