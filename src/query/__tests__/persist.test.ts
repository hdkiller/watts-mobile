import { describe, expect, it } from 'vitest';

import { shouldDehydratePersistedQuery, shouldPersistQuery } from '../persist';

function query(key: unknown[], status: 'success' | 'pending' | 'error' = 'success') {
  return {
    queryKey: key,
    state: { status },
  } as unknown as Parameters<typeof shouldPersistQuery>[0];
}

describe('shouldPersistQuery', () => {
  it('persists today and activity list/detail/planned', () => {
    expect(shouldPersistQuery(query(['today']))).toBe(true);
    expect(shouldPersistQuery(query(['activity', 'recent']))).toBe(true);
    expect(shouldPersistQuery(query(['activity', 'upcoming']))).toBe(true);
    expect(shouldPersistQuery(query(['activity', 'planned', 'p1']))).toBe(true);
    expect(shouldPersistQuery(query(['activity', 'detail', 'a1']))).toBe(true);
  });

  it('does not persist heavy activity streams', () => {
    expect(shouldPersistQuery(query(['activity', 'streams', 'a1']))).toBe(false);
    expect(shouldPersistQuery(query(['activity', 'power-curve', 'a1']))).toBe(false);
  });

  it('persists chat, notifications, profile, wellness, pmc', () => {
    expect(shouldPersistQuery(query(['chat', 'rooms']))).toBe(true);
    expect(shouldPersistQuery(query(['chat', 'messages', 'r1']))).toBe(true);
    expect(shouldPersistQuery(query(['notifications', 'inbox']))).toBe(true);
    expect(shouldPersistQuery(query(['profile', 'dashboard']))).toBe(true);
    expect(shouldPersistQuery(query(['profile', 'athlete']))).toBe(true);
    expect(shouldPersistQuery(query(['wellness', 'today']))).toBe(true);
    expect(shouldPersistQuery(query(['wellness', 'trend', 'a', 'b']))).toBe(true);
    expect(shouldPersistQuery(query(['performance', 'pmc', 90]))).toBe(true);
  });

  it('skips unrelated keys', () => {
    expect(shouldPersistQuery(query(['notifications', 'preferences']))).toBe(false);
    expect(shouldPersistQuery(query(['settings', 'ai', 'lite']))).toBe(false);
    expect(shouldPersistQuery(query([]))).toBe(false);
  });
});

describe('shouldDehydratePersistedQuery', () => {
  it('only dehydrates successful allowlisted queries', () => {
    expect(shouldDehydratePersistedQuery(query(['performance', 'pmc', 90], 'success'))).toBe(
      true
    );
    expect(shouldDehydratePersistedQuery(query(['performance', 'pmc', 90], 'pending'))).toBe(
      false
    );
    expect(shouldDehydratePersistedQuery(query(['performance', 'pmc', 90], 'error'))).toBe(
      false
    );
    expect(shouldDehydratePersistedQuery(query(['settings', 'ai'], 'success'))).toBe(false);
  });
});
