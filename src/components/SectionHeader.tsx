/* Hallmark · genre: modern-minimal · design-system: docs/DESIGN.md */
import { Text } from 'react-native';

/**
 * Top-level section heading for tab screens (Today, Plan, …).
 * Brand-colored and a step larger than the muted `text-xs` data labels so
 * sections read as sections — mirrors the web dashboard's section treatment.
 * Tile sub-labels (`text-[10px] … text-text-muted`) intentionally keep the
 * muted style; only screen-level sections use this.
 */
export function SectionHeader({ title, className }: { title: string; className?: string }) {
  return (
    <Text
      className={`text-sm font-semibold uppercase tracking-widest text-brand ${className ?? ''}`}
    >
      {title}
    </Text>
  );
}
