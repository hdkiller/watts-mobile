/**
 * In-app Expo Router hrefs after per-tab stacks (issue 049).
 * External deep-link paths (`/activities`, `/planned/:id`) stay stable; only
 * the resolved Expo Router targets live here.
 */

export const APP_HREFS = {
  today: '/(app)/(tabs)/today',
  log: '/(app)/(tabs)/log',
  coach: '/(app)/(tabs)/coach',
  more: '/(app)/(tabs)/more',
  activityList: '/(app)/(tabs)/today/activity',
  activityDetail: (id: string) =>
    `/(app)/(tabs)/today/activity/${encodeURIComponent(id)}` as const,
  plannedDetail: (id: string) =>
    `/(app)/(tabs)/today/planned/${encodeURIComponent(id)}` as const,
  upcoming: '/(app)/(tabs)/today/upcoming',
  eventsList: '/(app)/(tabs)/today/events',
  eventDetail: (id: string) =>
    `/(app)/(tabs)/today/events/${encodeURIComponent(id)}` as const,
  /** Root stack — Back returns to the tab that opened it (Today or More). */
  athlete: '/(app)/athlete',
  notifications: '/(app)/(tabs)/more/notifications',
  settings: '/(app)/(tabs)/more/settings',
  settingsNotifications: '/(app)/(tabs)/more/settings/notifications',
  settingsHealth: '/(app)/(tabs)/more/settings/health',
  settingsConnectedApps: '/(app)/(tabs)/more/settings/connected-apps',
  settingsSubscription: '/(app)/(tabs)/more/settings/subscription',
  settingsUnits: '/(app)/(tabs)/more/settings/units',
  settingsLog: '/(app)/(tabs)/more/settings/log',
  settingsNutrition: '/(app)/(tabs)/more/settings/nutrition',
  settingsSports: '/(app)/(tabs)/more/settings/sports',
  settingsCoach: '/(app)/(tabs)/more/settings/coach',
  sportProfile: (id: string) =>
    `/(app)/(tabs)/more/sports/${encodeURIComponent(id)}` as const,
  dailyCheckin: '/(app)/daily-checkin',
  recoveryEvent: '/(app)/recovery-event',
  recoveryEventEdit: (id: string) =>
    `/(app)/recovery-event?id=${encodeURIComponent(id)}` as const,
} as const;

/** One-shot Log → photo-meal intent. Always include a unique `t` so relaunches are not deduped. */
export function logCameraHref(nonce: string = String(Date.now())): string {
  return `${APP_HREFS.log}?action=camera&t=${encodeURIComponent(nonce)}`;
}

/** Rewrite legacy root-stack hrefs still present in push payloads / pending returns. */
export function migrateLegacyAppHref(href: string): string {
  if (!href.startsWith('/(app)')) return href;

  const rules: Array<[RegExp, string | ((m: RegExpMatchArray) => string)]> = [
    [/^\/\(app\)\/activity\/([^/?#]+)/, (m) => APP_HREFS.activityDetail(decodeURIComponent(m[1]!))],
    [/^\/\(app\)\/activity\/?$/, APP_HREFS.activityList],
    [/^\/\(app\)\/planned\/([^/?#]+)/, (m) => APP_HREFS.plannedDetail(decodeURIComponent(m[1]!))],
    [/^\/\(app\)\/upcoming\/?$/, APP_HREFS.upcoming],
    [/^\/\(app\)\/events\/([^/?#]+)/, (m) => APP_HREFS.eventDetail(decodeURIComponent(m[1]!))],
    [/^\/\(app\)\/events\/?$/, APP_HREFS.eventsList],
    [/^\/\(app\)\/notifications\/?$/, APP_HREFS.notifications],
    [/^\/\(app\)\/\(tabs\)\/more\/athlete\/?$/, APP_HREFS.athlete],
    [/^\/\(app\)\/settings\/notifications\/?$/, APP_HREFS.settingsNotifications],
    [/^\/\(app\)\/settings\/health\/?$/, APP_HREFS.settingsHealth],
    [/^\/\(app\)\/settings\/connected-apps\/?$/, APP_HREFS.settingsConnectedApps],
    [/^\/\(app\)\/settings\/subscription\/?$/, APP_HREFS.settingsSubscription],
    [/^\/\(app\)\/settings\/units\/?$/, APP_HREFS.settingsUnits],
    [/^\/\(app\)\/settings\/log\/?$/, APP_HREFS.settingsLog],
    [/^\/\(app\)\/settings\/nutrition\/?$/, APP_HREFS.settingsNutrition],
    [/^\/\(app\)\/settings\/sports\/?$/, APP_HREFS.settingsSports],
    [/^\/\(app\)\/settings\/coach\/?$/, APP_HREFS.settingsCoach],
    [/^\/\(app\)\/settings\/?$/, APP_HREFS.settings],
    [/^\/\(app\)\/sports\/([^/?#]+)/, (m) => APP_HREFS.sportProfile(decodeURIComponent(m[1]!))],
  ];

  for (const [re, dest] of rules) {
    const m = href.match(re);
    if (!m) continue;
    return typeof dest === 'function' ? dest(m) : dest;
  }
  return href;
}
