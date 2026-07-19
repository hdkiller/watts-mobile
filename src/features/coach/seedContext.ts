import type { RecoveryContextItem } from '@/src/features/recovery/types';
import type { TodayViewModel } from '@/src/features/today/types';

export type SeedContextInput = {
  today?: TodayViewModel | null;
  activeRecovery?: RecoveryContextItem[] | null;
};

/**
 * Short, non-prescriptive context for the first chat turn.
 * Never invents training advice — only restates cached Today / recovery facts.
 */
export function buildCoachSeedContext(input: SeedContextInput): string | null {
  const lines: string[] = [];
  const today = input.today;

  if (today?.action || today?.actionLabel) {
    const action = today.actionLabel || today.action;
    lines.push(`Today's recommendation: ${action}.`);
    if (today.rationale?.trim()) {
      lines.push(`Coach rationale: ${truncate(today.rationale.trim(), 180)}`);
    }
  }

  if (today?.plannedWorkout?.title) {
    const bits = [today.plannedWorkout.title];
    if (today.plannedWorkout.type) bits.push(today.plannedWorkout.type);
    lines.push(`Planned session: ${bits.join(' · ')}.`);
  }

  const recoveryBits: string[] = [];
  if (today?.recovery.sleepLabel) recoveryBits.push(`sleep ${today.recovery.sleepLabel}`);
  if (today?.recovery.hrvLabel) recoveryBits.push(`HRV ${today.recovery.hrvLabel}`);
  if (today?.recovery.feelLabel) recoveryBits.push(`feel ${today.recovery.feelLabel}`);
  if (recoveryBits.length > 0) {
    lines.push(`Recovery strip: ${recoveryBits.join(', ')}.`);
  }

  const active = (input.activeRecovery || []).slice(0, 3);
  if (active.length > 0) {
    const labels = active.map((item) => {
      const severity = item.severity != null ? ` (${item.severity}/10)` : '';
      return `${item.label}${severity}`;
    });
    lines.push(`Active recovery notes: ${labels.join('; ')}.`);
  }

  if (lines.length === 0) return null;

  return ['Context for this chat (facts only — do not invent a new plan):', ...lines].join('\n');
}

export function withSeedPrefix(userText: string, seed: string | null | undefined): string {
  const trimmed = userText.trim();
  if (!seed?.trim()) return trimmed;
  return `${seed.trim()}\n\nAthlete question: ${trimmed}`;
}

function truncate(value: string, max: number): string {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1).trimEnd()}…`;
}
