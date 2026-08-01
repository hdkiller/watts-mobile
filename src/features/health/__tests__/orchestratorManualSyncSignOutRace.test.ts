import { beforeEach, describe, expect, it, vi } from 'vitest';

// Keep retryLedgerItem deterministic: network "online", one on-device wellness sample.
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

// The upload call is the async gap where sign-out can race a manual retry —
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

describe('retryLedgerItem vs sign-out race (CW-271)', () => {
  let uploadStarted: Promise<void>;

  beforeEach(() => {
    vi.resetModules();
    resolveUpload = null;
    uploadStarted = new Promise((resolve) => {
      uploadStartedResolve = resolve;
    });
  });

  it('clearHealthSyncOnSignOut awaits an in-flight manual retry before clearing the ledger', async () => {
    const orchestrator = await import('../orchestrator');
    const { clearHealthSyncOnSignOut } = await import('../clearOnSignOut');
    const { saveLedgerItem, loadSyncLedger } = await import('../ledger');
    const { seedNeedsSync, wellnessLedgerId } = await import('../ledgerHelpers');
    const { setHealthSyncEnabled } = await import('../syncPreferences');
    await setHealthSyncEnabled(true);

    const id = wellnessLedgerId('2026-07-30');
    await saveLedgerItem(
      seedNeedsSync('wellness', {
        id,
        kind: 'wellness',
        platform: 'healthkit',
        title: 'Wellness',
        localDate: '2026-07-30',
      }),
    );

    const retryPromise = orchestrator.retryLedgerItem(id);

    // Wait until the retry is blocked inside the upload call, then sign out.
    await uploadStarted;
    let signOutFinished = false;
    const signOutPromise = clearHealthSyncOnSignOut().then(() => {
      signOutFinished = true;
    });

    // Sign-out must not resolve while the in-flight manual retry is still running.
    await new Promise((r) => setTimeout(r, 20));
    expect(signOutFinished).toBe(false);

    resolveUpload?.();
    await retryPromise;
    await signOutPromise;

    expect(signOutFinished).toBe(true);
    const ledger = await loadSyncLedger();
    expect(ledger).toEqual([]);
  });

  it('does not persist a ledger success if sign-out happens mid-retry-upload', async () => {
    const orchestrator = await import('../orchestrator');
    const { clearHealthSyncOnSignOut } = await import('../clearOnSignOut');
    const { saveLedgerItem, getLedgerItem } = await import('../ledger');
    const { seedNeedsSync, wellnessLedgerId } = await import('../ledgerHelpers');
    const { setHealthSyncEnabled } = await import('../syncPreferences');
    await setHealthSyncEnabled(true);

    const id = wellnessLedgerId('2026-07-30');
    await saveLedgerItem(
      seedNeedsSync('wellness', {
        id,
        kind: 'wellness',
        platform: 'healthkit',
        title: 'Wellness',
        localDate: '2026-07-30',
      }),
    );

    const retryPromise = orchestrator.retryLedgerItem(id);

    await uploadStarted;
    const signOutPromise = clearHealthSyncOnSignOut();

    // The upload (started before sign-out) only completes now — simulating a
    // stale manual retry finishing its network call after sign-out has begun.
    resolveUpload?.();

    await Promise.all([retryPromise, signOutPromise]);

    const item = await getLedgerItem(id);
    // The ledger was cleared by sign-out; even if an item re-appeared, it must
    // never have been marked "synced" by the cancelled retry.
    expect(item?.status).not.toBe('synced');
  });
});
