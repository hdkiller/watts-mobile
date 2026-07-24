/* Hallmark · component: link · genre: modern-minimal · design-system: docs/DESIGN.md · designed-as-app */
import { Text } from 'react-native';

import { AnimatedPressable } from '@/src/components/AnimatedPressable';

/** Inline brand link for Open web / handoff affordances. */
export function OpenWebLink({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <AnimatedPressable hitSlop={8} onPress={onPress} accessibilityRole="link">
      <Text className="text-sm font-semibold text-brand">{label}</Text>
    </AnimatedPressable>
  );
}
