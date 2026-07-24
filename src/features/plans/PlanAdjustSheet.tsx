/* Hallmark · component: sectioned-action-sheet · genre: modern-minimal · design-system: docs/DESIGN.md · designed-as-app
 * states: default · pressed · disabled · (focus via platform) · loading N/A · error N/A · success N/A
 * pre-emit critique: P5 H5 E5 S4 R5 V4 — This week first; Season collapsed by default
 */
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import { AnimatedPressable } from '@/src/components/AnimatedPressable';
import { BottomSheet } from '@/src/components/BottomSheet';
import { hapticLight } from '@/src/lib/haptics';

export type PlanAdjustAction = {
  id: string;
  label: string;
  hint?: string;
  destructive?: boolean;
  disabled?: boolean;
  onPress: () => void;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  thisWeek: PlanAdjustAction[];
  season: PlanAdjustAction[];
};

function Section({
  title,
  actions,
  onClose,
  collapsible,
  expanded,
  onToggle,
}: {
  title: string;
  actions: PlanAdjustAction[];
  onClose: () => void;
  collapsible?: boolean;
  expanded?: boolean;
  onToggle?: () => void;
}) {
  const showActions = !collapsible || expanded;

  return (
    <View className="mb-5">
      {collapsible ? (
        <AnimatedPressable
          hitSlop={8}
          onPress={() => {
            hapticLight();
            onToggle?.();
          }}
          accessibilityRole="button"
          accessibilityState={{ expanded: Boolean(expanded) }}
          accessibilityLabel={`${title}, ${expanded ? 'collapse' : 'expand'}`}
          className="mb-2 flex-row items-center justify-between"
        >
          <Text className="text-xs font-semibold uppercase tracking-widest text-text-muted">
            {title}
          </Text>
          <Text className="text-sm font-semibold text-brand">{expanded ? 'Hide' : 'Show'}</Text>
        </AnimatedPressable>
      ) : (
        <Text className="mb-2 text-xs font-semibold uppercase tracking-widest text-text-muted">
          {title}
        </Text>
      )}
      {showActions ? (
        <View className="overflow-hidden rounded-xl border border-border">
          {actions.map((action, index) => (
            <AnimatedPressable
              key={action.id}
              hitSlop={8}
              disabled={action.disabled}
              accessibilityRole="button"
              accessibilityLabel={action.label}
              accessibilityHint={action.hint}
              onPress={() => {
                if (action.disabled) return;
                hapticLight();
                onClose();
                setTimeout(() => action.onPress(), 180);
              }}
              className={`bg-card px-4 py-3.5 ${
                index > 0 ? 'border-t border-border/80' : ''
              } ${action.disabled ? 'opacity-40' : ''}`}
            >
              <Text
                className={`text-base font-medium ${
                  action.destructive ? 'text-danger' : 'text-text-primary'
                }`}
              >
                {action.label}
              </Text>
              {action.hint ? (
                <Text className="mt-0.5 text-sm text-text-muted">{action.hint}</Text>
              ) : null}
            </AnimatedPressable>
          ))}
        </View>
      ) : (
        <Text className="text-sm text-text-muted">
          Edit blocks, replan, or abandon — expand when you need season changes.
        </Text>
      )}
    </View>
  );
}

/** Single bottom sheet for Plan Adjust — This week + Season in one thumb-zone surface. */
export function PlanAdjustSheet({ visible, onClose, thisWeek, season }: Props) {
  const [seasonOpen, setSeasonOpen] = useState(false);

  useEffect(() => {
    if (visible) setSeasonOpen(false);
  }, [visible]);

  return (
    <BottomSheet visible={visible} onClose={onClose} testID="plan-adjust-sheet">
      <Text className="mb-1 text-lg font-semibold text-text-primary">Adjust plan</Text>
      <Text className="mb-5 text-sm text-text-muted">
        Change this week’s load, or reshape the season.
      </Text>

      <Section title="This week" actions={thisWeek} onClose={onClose} />
      <Section
        title="Season"
        actions={season}
        onClose={onClose}
        collapsible
        expanded={seasonOpen}
        onToggle={() => setSeasonOpen((v) => !v)}
      />

      <AnimatedPressable
        hitSlop={8}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Cancel"
        className="items-center py-3"
      >
        <Text className="text-base font-semibold text-text-muted">Cancel</Text>
      </AnimatedPressable>
    </BottomSheet>
  );
}
