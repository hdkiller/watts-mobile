## Context

Health Sync (`Settings → Health Sync`) already connects Apple Health / Health Connect, toggles Sync to Coach Watts + Sync workouts, runs Sync now, and opens Sync history. Sync history is **ledger-first**: it shows wellness days and workouts the orchestrator has already recorded. Workouts that never entered the ledger (or that athletes want to inspect as an on-device inventory) are hard to discover.

The sync stack already has the building blocks:

- `readPlatformWorkouts(window)` — HealthKit / Health Connect sessions (`LOOKBACK_DAYS = 14`)
- `fetchRemoteWorkoutsForMatch` — `GET /api/workouts` candidates
- `matchRemoteWorkout` + ledger status — synced vs needs_sync / failed
- `syncWorkoutSession` / `retryLedgerItem` — per-workout upload with `force`

This change adds a **phone-first Recent workouts** surface that composes those pieces for diagnosis and manual push.

## Goals / Non-Goals

**Goals:**

- List recent on-device workouts under Health Sync with clear Coach Watts sync status.
- Per-item Sync for unsynced / failed; Resync for already-synced (force re-upload / re-match).
- Sync all at list top when any unsynced items exist (only those items).
- Pull-to-refresh reloads phone inventory + remote match.
- iOS and Android parity via existing readers.

**Non-Goals:**

- Replacing Sync history (wellness + attempt log stays).
- Wellness-day inventory UI.
- New coach-wattz APIs or changing FIT upload contract.
- Writing to HealthKit / Health Connect.
- Infinite scroll beyond the existing lookback window (v1 = `LOOKBACK_DAYS`).

## Decisions

### 1. Dedicated route under Health Sync (not inline on the main screen)

**Choice:** New screen `health-workouts` (title: Recent workouts), linked from Health Sync next to Sync history.

**Why:** The main Health Sync screen is already dense (connect, toggles, privacy). A list with Sync all + pull-to-refresh needs its own scroll surface. Mirrors Sync history navigation.

**Alternative considered:** Embed a short preview on `health.tsx` — rejected for clutter; athletes who care will open the full list.

### 2. Phone-first list model (not ledger-only)

**Choice:** Build rows by reading platform workouts, then overlay ledger + remote match status.

Status mapping (display):

| Condition | Label |
|-----------|--------|
| Ledger `synced` or remote match found | Synced |
| Ledger `syncing` | Syncing |
| Ledger `failed` | Failed |
| Ledger `pending` | Pending |
| On device, no match, not synced | Needs sync |

Every on-device session in the lookback window appears even if never ledgered (seed `needs_sync` on sync action, same as orchestrator).

**Why:** Solves the gap Sync history cannot — “what’s on my phone?”

**Alternative considered:** Filter Sync history to workouts only — rejected because ledger-missing sessions stay invisible until a sync pass seeds them.

### 3. Reuse orchestrator upload path; export focused helpers

**Choice:** Add thin exports such as:

- `listRecentPlatformWorkoutsWithStatus()` — read + match + ledger overlay
- `syncWorkoutByPlatformSessionId(id, { force })` — wraps existing session sync
- `syncUnsyncedWorkouts()` — Sync all for needs_sync / failed / pending

Keep single-flight awareness with `runHealthSyncPass` where practical (or document that item sync may run while a pass is in flight and share upload helpers safely).

**Why:** Avoid duplicating FIT build / match / ledger update logic.

### 4. Sync all = unsynced only; Resync is per-item (and optional secondary)

**Choice:**

- **Sync all** (top): enabled only when ≥1 row is Needs sync / Failed / Pending; uploads those only.
- **Per-item Sync**: same statuses.
- **Per-item Resync**: shown for Synced rows; calls sync with `force: true` (re-match first; upload if still unmatched — same as orchestrator force path).

Do **not** put a second “Resync all” on this screen (Sync history already has Resync all for full lookback). Keeps Recent workouts focused on inventory + gap fill.

### 5. Pull-to-refresh

**Choice:** `RefreshControl` on the list reloads phone reads + `GET /api/workouts` match; does not auto-upload.

**Why:** Refresh is for truth; upload is explicit (Sync / Sync all).

### 6. Gating

**Choice:** Entry visible when Health platform is available; actions that upload require Sync to Coach Watts + Sync workouts on (same errors as `retryLedgerItem`). If workouts toggle is off, list still readable with disabled Sync CTAs and short copy explaining the toggle.

## Risks / Trade-offs

- **[Stale remote match]** Remote list fetched once per refresh → Mitigation: refresh after each successful sync; pull-to-refresh always re-fetches.
- **[Heavy FIT rebuild on Resync]** Forced resync re-reads streams → Mitigation: per-item only; Sync all skips already-synced.
- **[Overlap with Sync history]** Two workout UIs → Mitigation: copy distinguishes “on your phone” vs “what sync attempted”; Wellness stays only in history.
- **[Permission / empty Health]** Silent empty on iOS denial → Mitigation: reuse Health Sync empty guidance; show honest empty + link back to permissions.

## Migration Plan

- Ship as a pure mobile UI + helper change; no data migration.
- Existing ledger rows remain the status source of truth after first sync.
- Rollback: remove route + Health Sync link; orchestrator unchanged for background sync.

## Open Questions

- None blocking. Optional later: extend lookback beyond 14 days behind a “Load more” control if athletes need it.
