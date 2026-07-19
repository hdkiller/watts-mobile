/**
 * English-first message catalog.
 * Keys are stable for later Tolgee / shared-locale extraction.
 */
export const en = {
  'more.title': 'More',
  'more.signedInAs': 'Signed in as',
  'more.athleteFallback': 'Athlete',
  'more.refreshProfile': 'Refresh profile',
  'more.instance': 'Instance',
  'more.section.workouts': 'Workouts',
  'more.section.account': 'Account',
  'more.athlete': 'Athlete',
  'more.athleteHint': 'Metrics',
  'more.recentActivity': 'Recent activity',
  'more.recentActivityHint': 'Workouts',
  'more.upcoming': 'Upcoming',
  'more.upcomingHint': 'Planned',
  'more.notifications': 'Notifications',
  'more.notificationsHint': 'Inbox & alerts',
  'more.notificationPrefs': 'Notification settings',
  'more.notificationPrefsHint': 'System',
  'more.openWeb': 'Open web',
  'more.signOut': 'Sign out',

  'notifications.title': 'Notifications',
  'notifications.stubBody':
    'Inbox arrives with push registration. Deep links already resolve here.',
  'notifications.openSystemSettings': 'Open system settings',
  'notifications.manageOnWeb': 'Manage on web',
} as const;

export type MessageKey = keyof typeof en;
