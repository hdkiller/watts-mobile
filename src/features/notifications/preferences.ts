import type { NotificationPreferences } from './types';

/** Match coach-wattz `DEFAULT_MOBILE_PUSH_PREFERENCES` (SYNC_COMPLETED policy-off). */
export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  RECOMMENDATION_READY: true,
  WORKOUT_ANALYSIS_READY: true,
  SYNC_COMPLETED: false,
  COACH_MESSAGE: true,
};

/**
 * Normalize API / cache payloads into Settings keys.
 * `SYNC_COMPLETED` is always false on the client (no OS push; hide Settings toggle).
 */
export function normalizeNotificationPreferences(raw: unknown): NotificationPreferences {
  const o = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  return {
    RECOMMENDATION_READY: o.RECOMMENDATION_READY !== false,
    WORKOUT_ANALYSIS_READY: o.WORKOUT_ANALYSIS_READY !== false,
    SYNC_COMPLETED: false,
    COACH_MESSAGE: o.COACH_MESSAGE !== false,
  };
}
