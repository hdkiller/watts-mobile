/* Hallmark · component: badge · genre: modern-minimal · design-system: docs/DESIGN.md · designed-as-app */
import { Text, View } from 'react-native';

import type { AthleteReportBadge, AthleteReportBadgeTone } from './mapAthleteReport';

const BADGE_CONTAINER: Record<AthleteReportBadgeTone, string> = {
  success: 'border-success/30 bg-tint-success',
  recovery: 'border-recovery/40 bg-recovery/10',
  modify: 'border-modify/40 bg-modify/10',
  muted: 'border-border-strong bg-surface/60',
};

const BADGE_TEXT: Record<AthleteReportBadgeTone, string> = {
  success: 'text-success',
  recovery: 'text-recovery',
  modify: 'text-modify',
  muted: 'text-text-muted',
};

/** Colored status / trend chip (Developing, Declining, Improving, …). */
export function AthleteStatusBadge({ badge }: { badge: AthleteReportBadge }) {
  return (
    <View className={`rounded-full border px-2.5 py-1 ${BADGE_CONTAINER[badge.tone]}`}>
      <Text className={`text-[11px] font-semibold ${BADGE_TEXT[badge.tone]}`}>{badge.label}</Text>
    </View>
  );
}
