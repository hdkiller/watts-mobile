import { describe, expect, it } from 'vitest';

import { APP_HREFS, logCameraHref, migrateLegacyAppHref } from '../appHrefs';

describe('migrateLegacyAppHref', () => {
  it('rewrites root-stack drill-downs into tab stacks', () => {
    expect(migrateLegacyAppHref('/(app)/activity')).toBe(APP_HREFS.activityList);
    expect(migrateLegacyAppHref('/(app)/activity/abc')).toBe(APP_HREFS.activityDetail('abc'));
    expect(migrateLegacyAppHref('/(app)/planned/pw-1')).toBe(APP_HREFS.plannedDetail('pw-1'));
    expect(migrateLegacyAppHref('/(app)/upcoming')).toBe(APP_HREFS.upcoming);
    expect(migrateLegacyAppHref('/(app)/events')).toBe(APP_HREFS.eventsList);
    expect(migrateLegacyAppHref('/(app)/events/ev-1')).toBe(APP_HREFS.eventDetail('ev-1'));
    expect(migrateLegacyAppHref('/(app)/notifications')).toBe(APP_HREFS.notifications);
    expect(migrateLegacyAppHref('/(app)/settings')).toBe(APP_HREFS.settings);
    expect(migrateLegacyAppHref('/(app)/settings/nutrition')).toBe(APP_HREFS.settingsNutrition);
    expect(migrateLegacyAppHref('/(app)/settings/sports')).toBe(APP_HREFS.settingsSports);
  });

  it('rewrites More-tab athlete into the root stack', () => {
    expect(migrateLegacyAppHref('/(app)/(tabs)/more/athlete')).toBe(APP_HREFS.athlete);
  });

  it('leaves current hrefs alone', () => {
    expect(migrateLegacyAppHref(APP_HREFS.today)).toBe(APP_HREFS.today);
    expect(migrateLegacyAppHref(APP_HREFS.athlete)).toBe(APP_HREFS.athlete);
    expect(migrateLegacyAppHref(APP_HREFS.activityDetail('x'))).toBe(APP_HREFS.activityDetail('x'));
  });
});

describe('logCameraHref', () => {
  it('builds a one-shot camera intent with a nonce', () => {
    expect(logCameraHref('42')).toBe(`${APP_HREFS.log}?action=camera&t=42`);
  });
});
