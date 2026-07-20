/**
 * Canonical deep-link path map (scheme + push `data.path` + https `/go/*`).
 *
 * Freeze aliases once the first store build ships.
 *
 * | External path              | Expo Router href                         |
 * |----------------------------|------------------------------------------|
 * | `/today`                   | `/(app)/(tabs)/today`                    |
 * | `/today/recommendation`    | `/(app)/(tabs)/today`                    |
 * | `/recommendations/:id`     | `/(app)/(tabs)/today`                    |
 * | `/planned/:id`             | `/(app)/(tabs)/today/planned/:id`        |
 * | `/activities`              | `/(app)/(tabs)/today/activity`           |
 * | `/activities/:id`          | `/(app)/(tabs)/today/activity/:id`       |
 * | `/upcoming`                | `/(app)/(tabs)/today/upcoming`           |
 * | `/coach`                   | `/(app)/(tabs)/coach`                    |
 * | `/chat` / `/chat/:roomId`  | `/(app)/(tabs)/coach`                    |
 * | `/notifications`           | `/(app)/(tabs)/more/notifications`       |
 * | `/oauth/callback`          | (AuthSession — not product)              |
 */

export const APP_SCHEME = 'coachwatts';

/** HTTPS universal-link path prefix on coachwatts.com (avoids web route collisions). */
export const UNIVERSAL_LINK_PREFIX = '/go';

export const OAUTH_CALLBACK_PATH = '/oauth/callback';

/** Default targets when push has `data.type` but no `data.path`. */
export const PUSH_TYPE_DEFAULT_PATHS = {
  RECOMMENDATION_READY: '/today',
  WORKOUT_ANALYSIS_READY: '/activities',
  SYNC_COMPLETED: '/today',
  COACH_MESSAGE: '/coach',
} as const;

export type PushEventType = keyof typeof PUSH_TYPE_DEFAULT_PATHS;
