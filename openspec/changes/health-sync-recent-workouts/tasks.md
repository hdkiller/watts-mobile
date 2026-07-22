## 1. Inventory + sync helpers

- [x] 1.1 Add a list-builder that reads `readPlatformWorkouts` for the lookback window, overlays ledger + `fetchRemoteWorkoutsForMatch` / `matchRemoteWorkout`, and returns display rows (title, start, duration, status, platformSessionId)
- [x] 1.2 Export `syncWorkoutByPlatformSessionId(id, { force })` reusing orchestrator session upload / ledger updates
- [x] 1.3 Export `syncUnsyncedWorkouts()` that syncs only `needs_sync` / `failed` / `pending` rows from the current inventory
- [x] 1.4 Unit-test status overlay (on-device only → needs_sync; remote match / ledger synced → synced; failed ledger → failed)

## 2. Recent workouts screen

- [x] 2.1 Add settings route `health-workouts` + stack screen title “Recent workouts”
- [x] 2.2 Render newest-first list with status labels; empty state when no on-device workouts
- [x] 2.3 Add top **Sync all** (enabled only when unsynced rows exist); wire to `syncUnsyncedWorkouts`
- [x] 2.4 Add per-row **Sync** (unsynced) and **Resync** (synced); show in-row busy state while syncing
- [x] 2.5 Gate upload actions when Sync to Coach Watts or Sync workouts is off (clear message)
- [x] 2.6 Add pull-to-refresh that reloads inventory + remote match without uploading

## 3. Health Sync navigation

- [x] 3.1 Add Recent workouts entry on Health Sync (`health.tsx`) next to Sync history
- [x] 3.2 Ensure entry remains available when sync is on; if sync is off, still allow opening the list (read-only) or follow gating copy from design

## 4. Verify

- [ ] 4.1 Manual iOS: list shows HealthKit workouts; Sync one, Sync all, Resync, pull-to-refresh
- [ ] 4.2 Manual Android: same against Health Connect
- [ ] 4.3 Confirm Sync history still works for wellness + ledger retry; no regression to Sync now
