import { beforeEach, describe, expect, it, vi } from 'vitest';

// Keep the pass deterministic: no workouts, one wellness sample, network "online".
vi.mock('@tanstack/react-query', () => ({
  onlineManager: { isOnline: () => true },
}));

vi.mock('@/src/auth/tokenStorage', () => ({
  loadTokens: vi.fn(async () => ({
    accessToken: 'token-123',
    refreshToken: null,
    accessExpiresAt: null,
  })),
}));

vi.mock('../readers', () => ({
  readPlatformWellness: vi.fn(async () => [
    {
      date: '2026-07-30',
      platform: 'healthkit',
      restingHr: 55,
    },
  ]),
  readPlatformWorkouts: vi.fn(async () => []),
}));

vi.mock('../fetchRemoteWorkouts', () => ({
  fetchRemoteWorkoutsForMatch: vi.fn(async () => []),
}));

// Not exercised in this file, but orchestrator imports it eagerly and it pulls in
// expo-file-system (native-only) — stub it out so the module graph loads under vitest.
vi.mock('../uploadWorkout', () => ({
  uploadPlatformWorkout: vi.fn(async () => ({ queued: false })),
}));

// The upload call is the async gap where sign-out can race a running pass —
// let each test control exactly when it resolves and observe when it started.
let resolveUpload: (() => void) | null = null;
let uploadStartedResolve: (() => void) | undefined;

vi.mock('../uploadWellness', () => ({
  uploadWellnessPayload: vi.fn(
    () =>
      new Promise<void>((resolve) => {
        resolveUpload = resolve;
        uploadStartedResolve?.();
      }),
  ),
}));

describe('runHealthSyncPass vs sign-out race (CW-179)', () => {
  let uploadStarted: Promise<void>;

  beforeEach(() => {
    vi.resetModules();
    resolveUpload = null;
    uploadStarted = new Promise((resolve) => {
      uploadStartedResolve = resolve;
    });
  });

  it('does not persist a ledger success if sign-out happens mid-upload', async () => {
    const orchestrator = await import('../orchestrator');
    const { clearHealthSyncOnSignOut } = await import('../clearOnSignOut');
    const { getLedgerItem } = await import('../ledger');
    const { setHealthSyncEnabled } = await import('../syncPreferences');
    await setHealthSyncEnabled(true);

    const passPromise = orchestrator.runHealthSyncPass();

    // Wait until the pass is blocked inside the upload call, then sign out.
    await uploadStarted;
    const signOutPromise = clearHealthSyncOnSignOut();

    // The upload (started before sign-out) only completes now — simulating a
    // stale pass finishing its network call after sign-out has begun.
    resolveUpload?.();

    const [result] = await Promise.all([passPromise, signOutPromise]);

    expect(result.signedOutMidPass).toBe(true);
    expect(result.wellnessSynced).toBe(0);

    const item = await getLedgerItem('wellness:2026-07-30');
    // The ledger was cleared by sign-out; even if an item re-appeared, it must
    // never have been marked "synced" by the cancelled pass.
    expect(item?.status).not.toBe('synced');
  });

  it('clearHealthSyncOnSignOut awaits the in-flight pass before clearing the ledger', async () => {
    const orchestrator = await import('../orchestrator');
    const { clearHealthSyncOnSignOut } = await import('../clearOnSignOut');
    const { loadSyncLedger } = await import('../ledger');
    const { setHealthSyncEnabled } = await import('../syncPreferences');
    await setHealthSyncEnabled(true);

    const passPromise = orchestrator.runHealthSyncPass();
    await uploadStarted;

    let signOutFinished = false;
    const signOutPromise = clearHealthSyncOnSignOut().then(() => {
      signOutFinished = true;
    });

    // Sign-out must not resolve while the in-flight pass is still running.
    await new Promise((r) => setTimeout(r, 20));
    expect(signOutFinished).toBe(false);

    resolveUpload?.();
    await passPromise;
    await signOutPromise;

    expect(signOutFinished).toBe(true);
    const ledger = await loadSyncLedger();
    expect(ledger).toEqual([]);
  });
});
