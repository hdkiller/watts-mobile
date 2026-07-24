/* Hallmark · genre: modern-minimal · design-system: docs/DESIGN.md · designed-as-app
 * pre-emit critique: P4 H4 E4 S4 R5 V4 — proportional phases; week stats as metadata line
 */
import { Text, View } from 'react-native';

import { AnimatedPressable } from '@/src/components/AnimatedPressable';
import { hapticLight } from '@/src/lib/haptics';
import { blockTypeColor } from '@/src/theme/colors';
import { useThemeColors } from '@/src/theme/useThemeColors';

import {
  formatVolumeHours,
  humanizeBlockType,
  shortBlockLabel,
} from './formatPlanCopy';
import type { PlanBlockShell, PlanWeekShell } from './types';

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
  const theme = useThemeColors();
  if (blocks.length === 0) return null;

  const totalWeeks = blocks.reduce((sum, b) => sum + Math.max(1, b.durationWeeks), 0);

  return (
    <View
      testID="plan-season-timeline"
      className="gap-2"
      accessibilityLabel={`Season, ${totalWeeks} week${totalWeeks === 1 ? '' : 's'}`}
    >
      <View className="relative overflow-hidden rounded-xl border border-border bg-card/80">
        <View className="h-14 flex-row">
          {blocks.map((block) => {
            const selected = block.id === selectedBlockId;
            const accent = blockTypeColor(block.type);
            const weeks = Math.max(1, block.durationWeeks);
            const cadence = block.recoveryWeekIndex ?? 4;
            return (
              <AnimatedPressable
                key={block.id}
                testID={`plan-timeline-block-${block.id}`}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                accessibilityLabel={`${block.name}, ${humanizeBlockType(block.type) ?? block.type}, ${weeks} weeks`}
                hitSlop={8}
                onPress={() => {
                  hapticLight();
                  onSelectBlock(block.id);
                }}
                style={{ flex: weeks }}
                className={`min-w-[36px] justify-between border-r border-border/60 px-1.5 py-1.5 last:border-r-0 ${
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
                    {shortBlockLabel(block.name)}
                  </Text>
                  <Text className="text-xs text-text-muted">{weeks}w</Text>
                </View>
                <View className="mt-1 flex-row items-end gap-0.5">
                  {Array.from({ length: Math.min(weeks, 8) }, (_, i) => {
                    const weekNum = i + 1;
                    const recovery = cadence > 0 && weekNum % cadence === 0;
                    return (
                      <View
                        key={`${block.id}-w${weekNum}`}
                        className="flex-1 rounded-sm"
                        style={{
                          height: recovery ? 4 : 8,
                          backgroundColor: recovery ? theme.brand : accent,
                          opacity: recovery ? 1 : 0.6,
                        }}
                      />
                    );
                  })}
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
          })}
        </View>

        {todayPercent != null && todayPercent >= 0 && todayPercent <= 100 ? (
          <View
            pointerEvents="none"
            className="absolute bottom-0 top-0 w-0.5 bg-recovery"
            style={{ left: `${todayPercent}%` }}
            accessibilityElementsHidden
          />
        ) : null}
      </View>
      <Text className="text-xs text-text-muted">
        {totalWeeks} week{totalWeeks === 1 ? '' : 's'}
      </Text>
    </View>
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
