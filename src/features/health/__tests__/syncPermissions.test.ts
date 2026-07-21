import { describe, expect, it, vi } from 'vitest';
import {
  hasRequiredHealthConnectPermissions,
  HEALTH_CONNECT_SYNC_PERMISSIONS,
} from '../syncPermissions';

vi.mock('react-native', () => ({ Platform: { OS: 'ios' } }));

const OPTIONAL = ['BackgroundAccessPermission', 'ExerciseRoute'];

describe('hasRequiredHealthConnectPermissions', () => {
  const dataPermissions = HEALTH_CONNECT_SYNC_PERMISSIONS.filter(
    (permission) => !OPTIONAL.includes(permission.recordType)
  );

  it('accepts all data permissions without the optional ones', () => {
    expect(hasRequiredHealthConnectPermissions(dataPermissions)).toBe(true);
  });

  it('rejects a partial grant', () => {
    expect(hasRequiredHealthConnectPermissions(dataPermissions.slice(1))).toBe(false);
  });

  it('does not require route access — declining routes must not block sync', () => {
    const withoutRoutes = HEALTH_CONNECT_SYNC_PERMISSIONS.filter(
      (permission) => permission.recordType !== 'ExerciseRoute'
    );
    expect(hasRequiredHealthConnectPermissions(withoutRoutes)).toBe(true);
  });

  it('requests route access so bulk route reads are possible', () => {
    expect(
      HEALTH_CONNECT_SYNC_PERMISSIONS.some(
        (permission) =>
          permission.recordType === 'ExerciseRoute' && permission.accessType === 'read'
      )
    ).toBe(true);
  });
});
