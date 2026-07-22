## Why

Athletes cannot see which workouts exist on their phone (HealthKit / Health Connect) versus which ones Coach Watts already has. Sync history only lists ledger items the pipeline has already touched, so gaps that never entered the ledger stay invisible — and there is no phone-first place to force-sync a single workout, sync all unsynced ones, or refresh the inventory.

## What Changes

- Add a **Recent workouts** surface under Settings → Health Sync that lists on-device workouts from the platform lookback window, each with Coach Watts sync status (`on phone` / `synced` / `needs sync` / `failed` / `syncing`).
- Support **per-item Sync** (and Resync for already-synced items) so the athlete can push one workout without running a full pass.
- Support **Sync all** at the top of the list when any rows are unsynced (needs sync / failed / pending), uploading only those items.
- Support **pull-to-refresh** to re-read the phone store and re-match against Coach Watts.
- Keep existing **Sync history** for wellness + attempt ledger; Recent workouts is workout-only and phone-first.
- No backend API changes required — reuse `GET /api/workouts` match + existing FIT upload path.

## Capabilities

### New Capabilities
- `health-sync-recent-workouts`: Phone-first recent workout inventory under Health Sync, with sync status, per-item sync/resync, Sync all for unsynced, and pull-to-refresh.

### Modified Capabilities
- `settings-hub`: Health Sync settings gains an entry to Recent workouts (alongside Sync history).

## Impact

- **UI:** `app/(app)/(tabs)/more/settings/health.tsx` (nav entry), new route e.g. `health-workouts.tsx`, settings stack layout.
- **Health feature:** Reuse `readPlatformWorkouts`, `fetchRemoteWorkoutsForMatch`, `matchRemoteWorkout`, ledger helpers, and orchestrator upload/`retryLedgerItem` patterns; may add a thin list-builder + `syncWorkoutBySessionId` / `syncUnsyncedWorkouts` exports.
- **APIs (existing):** `GET /api/workouts` for match candidates; workout FIT upload already used by Health Sync — no coach-wattz contract change.
- **Deps:** None new; native HealthKit / Health Connect read permissions already requested for workout sync.
- **Out of scope:** Wellness-day inventory, writing back to HealthKit/Health Connect, editing workouts, analytics explorer.
