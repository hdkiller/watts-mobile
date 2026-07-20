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
  'more.openWeb': 'Open Coach Watts',
  'more.signOut': 'Sign out',

  'notifications.title': 'Notifications',
  'notifications.stubBody':
    'When a recommendation or analysis is ready, it will show up here.',
  'notifications.openSystemSettings': 'Open system settings',
  'notifications.manageOnWeb': 'Manage in Coach Watts',
} as const;

export type MessageKey = keyof typeof en;
