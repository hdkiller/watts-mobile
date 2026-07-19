import type { SFSymbol } from 'expo-symbols';

import type {
  JourneyEventCategory,
  JourneyEventOptionId,
  JourneyEventType,
  SeverityPresetId,
} from './types';

/** Keep in sync with coach-wattz RecoveryContextSlideover journeyEventOptions. */
export type JourneyEventOption = {
  id: JourneyEventOptionId;
  title: string;
  subtitle: string;
  /** SF Symbol for iOS; emoji fallback elsewhere (mirrors web Lucide icons). */
  sf: SFSymbol;
  emoji: string;
  category: JourneyEventCategory;
  eventType: JourneyEventType;
};

export const JOURNEY_EVENT_OPTIONS: JourneyEventOption[] = [
  {
    id: 'illness',
    title: 'Illness / sick',
    subtitle: 'Cold, fever, flu, feeling run down, or unexplained crash.',
    sf: 'thermometer',
    emoji: '🌡️',
    category: 'FATIGUE',
    eventType: 'WELLNESS_CHECK',
  },
  {
    id: 'injury',
    title: 'Injury / pain',
    subtitle: 'Pain, soreness, or something that may limit normal training.',
    sf: 'cross.case.fill',
    emoji: '🩹',
    category: 'MUSCLE_PAIN',
    eventType: 'SYMPTOM',
  },
  {
    id: 'fatigue',
    title: 'Fatigue / heavy legs',
    subtitle: 'Low energy, unusually hard effort, flat legs, or poor readiness.',
    sf: 'battery.25percent',
    emoji: '🪫',
    category: 'FATIGUE',
    eventType: 'SYMPTOM',
  },
  {
    id: 'sleep',
    title: 'Poor sleep',
    subtitle: 'Short sleep, frequent wakeups, restless night, or poor sleep quality.',
    sf: 'moon.stars',
    emoji: '🌙',
    category: 'SLEEP',
    eventType: 'WELLNESS_CHECK',
  },
  {
    id: 'mood',
    title: 'Mood / stress',
    subtitle: 'Stress, anxiety, emotional strain, or feeling mentally off.',
    sf: 'cloud.bolt',
    emoji: '⛈️',
    category: 'MOOD',
    eventType: 'WELLNESS_CHECK',
  },
  {
    id: 'gi',
    title: 'GI issues',
    subtitle: 'Nausea, bloating, stomach discomfort, or gut problems during training.',
    sf: 'allergens',
    emoji: '🐚',
    category: 'GI_DISTRESS',
    eventType: 'SYMPTOM',
  },
  {
    id: 'cramping',
    title: 'Cramping',
    subtitle: 'Muscle cramping, tightness, or spasms affecting performance.',
    sf: 'bolt.fill',
    emoji: '⚡️',
    category: 'CRAMPING',
    eventType: 'SYMPTOM',
  },
  {
    id: 'dizziness',
    title: 'Dizziness',
    subtitle: 'Lightheadedness, dizziness, or feeling unstable.',
    sf: 'arrow.triangle.2.circlepath',
    emoji: '💫',
    category: 'DIZZINESS',
    eventType: 'SYMPTOM',
  },
  {
    id: 'hunger',
    title: 'Hunger / underfueled',
    subtitle: 'Low energy from underfueling, hunger, or poor intake.',
    sf: 'fork.knife',
    emoji: '🍽️',
    category: 'HUNGER',
    eventType: 'SYMPTOM',
  },
  {
    id: 'note',
    title: 'General recovery note',
    subtitle: 'Anything unusual you want Coach Watts to remember or correlate.',
    sf: 'square.and.pencil',
    emoji: '📝',
    category: 'FATIGUE',
    eventType: 'RECOVERY_NOTE',
  },
];

export const SEVERITY_PRESETS: {
  id: SeverityPresetId;
  label: string;
  value: number;
  description: string;
  sf: SFSymbol;
  emoji: string;
}[] = [
  {
    id: 'mild',
    label: 'Mild',
    value: 3,
    description: 'Noticeable but manageable.',
    sf: 'leaf',
    emoji: '🍃',
  },
  {
    id: 'moderate',
    label: 'Moderate',
    value: 6,
    description: 'Clearly affecting recovery or training.',
    sf: 'gauge.with.dots.needle.33percent',
    emoji: '📊',
  },
  {
    id: 'severe',
    label: 'Severe',
    value: 9,
    description: 'Strong impact, likely explains major disruption.',
    sf: 'exclamationmark.triangle',
    emoji: '⚠️',
  },
];

export const DESCRIPTION_MAX = 500;

export function optionById(id: JourneyEventOptionId): JourneyEventOption {
  const found = JOURNEY_EVENT_OPTIONS.find((o) => o.id === id);
  if (!found) return JOURNEY_EVENT_OPTIONS[0]!;
  return found;
}

export function findOptionForCategoryType(
  category: string | null | undefined,
  eventType: string | null | undefined
): JourneyEventOption {
  const exact = JOURNEY_EVENT_OPTIONS.find(
    (o) => o.category === category && o.eventType === eventType
  );
  if (exact) return exact;
  const byCategory = JOURNEY_EVENT_OPTIONS.find((o) => o.category === category);
  return byCategory ?? JOURNEY_EVENT_OPTIONS[0]!;
}

export function severityPresetFromValue(severity: number | null | undefined): SeverityPresetId {
  const value = severity ?? 6;
  if (value <= 4) return 'mild';
  if (value <= 7) return 'moderate';
  return 'severe';
}

export function severityValueFromPreset(id: SeverityPresetId): number {
  return SEVERITY_PRESETS.find((p) => p.id === id)?.value ?? 6;
}
