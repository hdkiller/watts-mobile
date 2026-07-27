import { describe, expect, it, vi } from 'vitest';
import {
  hasRequiredHealthConnectPermissions,
  HEALTH_CONNECT_SYNC_PERMISSIONS,
} from '../syncPermissions';

vi.mock('react-native', () => ({ Platform: { OS: 'ios' } }));

const OPTIONAL = ['BackgroundAccessPermission'];

describe('hasRequiredHealthConnectPermissions', () => {
  const dataPermissions = HEALTH_CONNECT_SYNC_PERMISSIONS.filter(
    (permission) => !OPTIONAL.includes(permission.recordType),
  );

  it('accepts all data permissions without the optional ones', () => {
    expect(hasRequiredHealthConnectPermissions(dataPermissions)).toBe(true);
  });

  it('rejects a partial grant', () => {
    expect(hasRequiredHealthConnectPermissions(dataPermissions.slice(1))).toBe(false);
  });

  it('does not require background access — declining it must not block sync', () => {
    const withoutBackground = HEALTH_CONNECT_SYNC_PERMISSIONS.filter(
      (permission) => permission.recordType !== 'BackgroundAccessPermission',
    );
    expect(hasRequiredHealthConnectPermissions(withoutBackground)).toBe(true);
  });
});

describe('HEALTH_CONNECT_SYNC_PERMISSIONS', () => {
  it('never requests read access to ExerciseRoute', () => {
    // Only the *write* route permission is special-cased natively; a read entry
    // throws InvalidRecordType and takes every other permission down with it, so
    // a single bad entry means no Health Connect prompt at all.
    //
    // The real guard is the `satisfies readonly (Permission | BackgroundAccessPermission)[]`
    // on the list itself, which makes this a compile error. This case just keeps
    // the incident documented — and catches a re-introduced `as` cast, which is
    // how it got past the compiler the first time.
    const requested: readonly { accessType: string; recordType: string }[] =
      HEALTH_CONNECT_SYNC_PERMISSIONS;
    expect(requested.some((permission) => permission.recordType === 'ExerciseRoute')).toBe(false);
  });
});
