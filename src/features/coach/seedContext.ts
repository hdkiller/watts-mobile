import type { RecoveryContextItem } from '@/src/features/recovery/types';
import type { TodayViewModel } from '@/src/features/today/types';
import { isPlausibleSleepHours } from '@/src/features/wellness/plausibility';

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
  if (today?.recovery.sleepLabel && isPlausibleSleepLabel(today.recovery.sleepLabel)) {
    recoveryBits.push(`sleep ${today.recovery.sleepLabel}`);
  }
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

const ATHLETE_QUESTION_MARKER = 'Athlete question:';

export function withSeedPrefix(userText: string, seed: string | null | undefined): string {
  const trimmed = userText.trim();
  if (!seed?.trim()) return trimmed;
  return `${seed.trim()}\n\n${ATHLETE_QUESTION_MARKER} ${trimmed}`;
}

/**
 * Strip the internal seed block from a user message for display.
 * Server still receives the full `withSeedPrefix` text; athletes should only see their question.
 */
export function displayAthleteText(text: string): string {
  const raw = text.trim();
  if (!raw) return raw;

  const markerIdx = raw.lastIndexOf(ATHLETE_QUESTION_MARKER);
  if (markerIdx === -1) return raw;

  // Only strip when the seed preamble is present (avoid clipping normal athlete text).
  const looksSeeded =
    raw.startsWith('Context for this chat') ||
    raw.includes("Today's recommendation:") ||
    raw.includes('Planned session:') ||
    raw.includes('Recovery strip:');
  if (!looksSeeded) return raw;

  return raw.slice(markerIdx + ATHLETE_QUESTION_MARKER.length).trim();
}

function truncate(value: string, max: number): string {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1).trimEnd()}…`;
}

/** Drop numeric sleep labels that look like sync artifacts (e.g. "0.2h"). */
function isPlausibleSleepLabel(label: string): boolean {
  const match = label.trim().match(/^(\d+(?:\.\d+)?)\s*h(?:ours?)?$/i);
  if (!match) return true; // qualitative labels ("poor", "78") pass through
  return isPlausibleSleepHours(Number(match[1]));
}
