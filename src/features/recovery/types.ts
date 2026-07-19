export type JourneyEventCategory =
  | 'GI_DISTRESS'
  | 'MUSCLE_PAIN'
  | 'FATIGUE'
  | 'SLEEP'
  | 'MOOD'
  | 'CRAMPING'
  | 'DIZZINESS'
  | 'HUNGER';

export type JourneyEventType = 'SYMPTOM' | 'WELLNESS_CHECK' | 'RECOVERY_NOTE';

export type RecoveryContextKind = 'wellness' | 'journey_event' | 'daily_checkin';
export type RecoveryContextSourceType = 'imported' | 'manual_event' | 'daily_checkin';

export type JourneyEventOptionId =
  | 'illness'
  | 'injury'
  | 'fatigue'
  | 'sleep'
  | 'mood'
  | 'gi'
  | 'cramping'
  | 'dizziness'
  | 'hunger'
  | 'note';

export type SeverityPresetId = 'mild' | 'moderate' | 'severe';
export type TimePresetId = 'now' | 'earlier-today' | 'yesterday' | 'custom';

export type RecoveryContextItem = {
  id: string;
  sourceRecordId: string;
  kind: RecoveryContextKind;
  sourceType: RecoveryContextSourceType;
  label: string;
  description: string | null;
  severity: number | null;
  startAt: string;
  endAt: string;
  editable: boolean;
  deletable: boolean;
  origin: string;
  category: string | null;
  metadata?: Record<string, unknown>;
};

export type JourneyEventPayload = {
  timestamp: string;
  eventType: JourneyEventType;
  category: JourneyEventCategory;
  severity: number;
  description?: string | null;
};

export type RecoveryEventFormValues = {
  optionId: JourneyEventOptionId;
  severityPreset: SeverityPresetId;
  timePreset: TimePresetId;
  /** Local datetime string `YYYY-MM-DDTHH:mm` for custom / display */
  localTimestamp: string;
  description: string;
};
