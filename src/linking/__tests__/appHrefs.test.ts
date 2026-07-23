import { describe, expect, it } from 'vitest';

import { APP_HREFS, logCameraHref, migrateLegacyAppHref } from '../appHrefs';

describe('migrateLegacyAppHref', () => {
  it('rewrites Today-tab nested drill-downs into the root stack', () => {
    expect(migrateLegacyAppHref('/(app)/(tabs)/today/activity')).toBe(APP_HREFS.activityList);
    expect(migrateLegacyAppHref('/(app)/(tabs)/today/activity/abc')).toBe(
      APP_HREFS.activityDetail('abc')
    );
    expect(migrateLegacyAppHref('/(app)/(tabs)/today/planned/pw-1')).toBe(
      APP_HREFS.plannedDetail('pw-1')
    );
    expect(migrateLegacyAppHref('/(app)/(tabs)/today/upcoming')).toBe(APP_HREFS.upcoming);
    expect(migrateLegacyAppHref('/(app)/(tabs)/today/events')).toBe(APP_HREFS.eventsList);
    expect(migrateLegacyAppHref('/(app)/(tabs)/today/events/ev-1')).toBe(
      APP_HREFS.eventDetail('ev-1')
    );
  });

  it('rewrites More-nested athlete / health / sports / goals into the root stack', () => {
    expect(migrateLegacyAppHref('/(app)/(tabs)/more/athlete')).toBe(APP_HREFS.athlete);
    expect(migrateLegacyAppHref('/(app)/(tabs)/more/goals')).toBe(APP_HREFS.goalsList);
    expect(migrateLegacyAppHref('/(app)/(tabs)/more/goals/g-1')).toBe(
      APP_HREFS.goalDetail('g-1')
    );
    expect(migrateLegacyAppHref('/(app)/(tabs)/more/settings/health')).toBe(
      APP_HREFS.settingsHealth
    );
    expect(migrateLegacyAppHref('/(app)/(tabs)/more/settings/connected-apps')).toBe(
      APP_HREFS.settingsConnectedApps
    );
    expect(migrateLegacyAppHref('/(app)/(tabs)/more/settings/sports')).toBe(
      APP_HREFS.settingsSports
    );
    expect(migrateLegacyAppHref('/(app)/(tabs)/more/sports/sp-1')).toBe(
      APP_HREFS.sportProfile('sp-1')
    );
  });

  it('rewrites flat settings aliases', () => {
    expect(migrateLegacyAppHref('/(app)/settings')).toBe(APP_HREFS.settings);
    expect(migrateLegacyAppHref('/(app)/settings/nutrition')).toBe(APP_HREFS.settingsNutrition);
    expect(migrateLegacyAppHref('/(app)/notifications')).toBe(APP_HREFS.notifications);
  });

  it('leaves current hrefs alone', () => {
    expect(migrateLegacyAppHref(APP_HREFS.today)).toBe(APP_HREFS.today);
    expect(migrateLegacyAppHref(APP_HREFS.athlete)).toBe(APP_HREFS.athlete);
    expect(migrateLegacyAppHref(APP_HREFS.activityDetail('x'))).toBe(APP_HREFS.activityDetail('x'));
    expect(migrateLegacyAppHref(APP_HREFS.settingsHealth)).toBe(APP_HREFS.settingsHealth);
  });
});

describe('goals/events create hrefs', () => {
  it('exposes new create routes on the root stack', () => {
    expect(APP_HREFS.goalsNew).toBe('/(app)/goals/new');
    expect(APP_HREFS.eventsNew).toBe('/(app)/events/new');
  });
});

describe('logCameraHref', () => {
  it('builds a one-shot camera intent with a nonce', () => {
    expect(logCameraHref('42')).toBe(`${APP_HREFS.log}?action=camera&t=42`);
  });
});
