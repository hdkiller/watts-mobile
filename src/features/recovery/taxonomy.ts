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
  category: JourneyEventCategory;
  eventType: JourneyEventType;
};

export const JOURNEY_EVENT_OPTIONS: JourneyEventOption[] = [
  {
    id: 'illness',
    title: 'Illness / sick',
    subtitle: 'Cold, fever, flu, feeling run down, or unexplained crash.',
    category: 'FATIGUE',
    eventType: 'WELLNESS_CHECK',
  },
  {
    id: 'injury',
    title: 'Injury / pain',
    subtitle: 'Pain, soreness, or something that may limit normal training.',
    category: 'MUSCLE_PAIN',
    eventType: 'SYMPTOM',
  },
  {
    id: 'fatigue',
    title: 'Fatigue / heavy legs',
    subtitle: 'Low energy, unusually hard effort, flat legs, or poor readiness.',
    category: 'FATIGUE',
    eventType: 'SYMPTOM',
  },
  {
    id: 'sleep',
    title: 'Poor sleep',
    subtitle: 'Short sleep, frequent wakeups, restless night, or poor sleep quality.',
    category: 'SLEEP',
    eventType: 'WELLNESS_CHECK',
  },
  {
    id: 'mood',
    title: 'Mood / stress',
    subtitle: 'Stress, anxiety, emotional strain, or feeling mentally off.',
    category: 'MOOD',
    eventType: 'WELLNESS_CHECK',
  },
  {
    id: 'gi',
    title: 'GI issues',
    subtitle: 'Nausea, bloating, stomach discomfort, or gut problems during training.',
    category: 'GI_DISTRESS',
    eventType: 'SYMPTOM',
  },
  {
    id: 'cramping',
    title: 'Cramping',
    subtitle: 'Muscle cramping, tightness, or spasms affecting performance.',
    category: 'CRAMPING',
    eventType: 'SYMPTOM',
  },
  {
    id: 'dizziness',
    title: 'Dizziness',
    subtitle: 'Lightheadedness, dizziness, or feeling unstable.',
    category: 'DIZZINESS',
    eventType: 'SYMPTOM',
  },
  {
    id: 'hunger',
    title: 'Hunger / underfueled',
    subtitle: 'Low energy from underfueling, hunger, or poor intake.',
    category: 'HUNGER',
    eventType: 'SYMPTOM',
  },
  {
    id: 'note',
    title: 'General recovery note',
    subtitle: 'Anything unusual you want Coach Watts to remember or correlate.',
    category: 'FATIGUE',
    eventType: 'RECOVERY_NOTE',
  },
];

export const SEVERITY_PRESETS: {
  id: SeverityPresetId;
  label: string;
  value: number;
  description: string;
}[] = [
  { id: 'mild', label: 'Mild', value: 3, description: 'Noticeable but manageable.' },
  {
    id: 'moderate',
    label: 'Moderate',
    value: 6,
    description: 'Clearly affecting recovery or training.',
  },
  {
    id: 'severe',
    label: 'Severe',
    value: 9,
    description: 'Strong impact, likely explains major disruption.',
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
