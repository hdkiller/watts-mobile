import { describe, expect, it } from 'vitest';

import { t } from '../t';

describe('i18n t() helper', () => {
  it('resolves message keys from the English catalog', () => {
    expect(t('more.title')).toBe('More');
    expect(t('more.signOut')).toBe('Sign out');
    expect(t('notifications.title')).toBe('Notifications');
  });
});
