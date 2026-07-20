import { describe, expect, it } from 'vitest';

import { APP_HREFS, migrateLegacyAppHref } from '../appHrefs';

describe('migrateLegacyAppHref', () => {
  it('rewrites root-stack drill-downs into tab stacks', () => {
    expect(migrateLegacyAppHref('/(app)/activity')).toBe(APP_HREFS.activityList);
    expect(migrateLegacyAppHref('/(app)/activity/abc')).toBe(APP_HREFS.activityDetail('abc'));
    expect(migrateLegacyAppHref('/(app)/planned/pw-1')).toBe(APP_HREFS.plannedDetail('pw-1'));
    expect(migrateLegacyAppHref('/(app)/upcoming')).toBe(APP_HREFS.upcoming);
    expect(migrateLegacyAppHref('/(app)/notifications')).toBe(APP_HREFS.notifications);
    expect(migrateLegacyAppHref('/(app)/settings')).toBe(APP_HREFS.settings);
    expect(migrateLegacyAppHref('/(app)/settings/sports')).toBe(APP_HREFS.settingsSports);
  });

  it('leaves current hrefs alone', () => {
    expect(migrateLegacyAppHref(APP_HREFS.today)).toBe(APP_HREFS.today);
    expect(migrateLegacyAppHref(APP_HREFS.activityDetail('x'))).toBe(APP_HREFS.activityDetail('x'));
  });
});
