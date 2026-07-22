# health-sync-recent-workouts Specification

## Purpose
TBD - created by archiving change health-sync-recent-workouts. Update Purpose after archive.
## Requirements
### Requirement: Phone-first recent workouts list
Settings → Health Sync SHALL expose a Recent workouts surface that lists workouts present on the device from Apple Health (HealthKit) or Health Connect for the Health Sync lookback window, newest first. Each row SHALL show a human-readable title (sport/type and time), duration or start time, and Coach Watts sync status derived from the local ledger and remote workout match (`synced`, `needs_sync`, `failed`, `pending`, or `syncing`).

#### Scenario: Open recent workouts
- **WHEN** the athlete opens Recent workouts from Health Sync
- **THEN** the app shows on-device workouts with per-row sync status

#### Scenario: Empty on-device list
- **WHEN** the platform store returns no workouts in the lookback window
- **THEN** the surface shows an honest empty state explaining that workouts appear after they exist on the phone and Coach Watts has read access

#### Scenario: Unsynced workout visible without prior ledger entry
- **WHEN** a workout exists on the device but has never been recorded in the sync ledger and does not match a Coach Watts workout
- **THEN** the row still appears with status `needs_sync` (or equivalent “Needs sync” label)

### Requirement: Per-item sync and resync
For each workout row that is not currently syncing, the Recent workouts surface SHALL offer an explicit action: Sync when status is `needs_sync`, `failed`, or `pending`; Resync when status is `synced`. Sync/Resync SHALL upload or re-attempt that platform session only (force re-match / upload) and update the row status from the result.

#### Scenario: Sync one unsynced workout
- **WHEN** the athlete taps Sync on a `needs_sync` or `failed` workout
- **THEN** the app attempts FIT upload for that platform session only and refreshes that row’s status

#### Scenario: Resync a synced workout
- **WHEN** the athlete taps Resync on a `synced` workout
- **THEN** the app force-retries match/upload for that platform session and updates the row from the result

#### Scenario: Sync gated by preferences
- **WHEN** Sync to Coach Watts or Sync workouts is disabled
- **THEN** Sync / Resync / Sync all are unavailable (disabled or blocked with a clear message) until those preferences are enabled

### Requirement: Sync all unsynced at list top
When one or more listed workouts are `needs_sync`, `failed`, or `pending`, the Recent workouts surface SHALL show a Sync all control at the top of the list that syncs only those unsynced items. When every listed workout is already `synced` (or the list is empty), Sync all SHALL be hidden or disabled.

#### Scenario: Sync all when gaps exist
- **WHEN** the list includes at least one unsynced workout and the athlete taps Sync all
- **THEN** the app syncs each unsynced workout and refreshes statuses

#### Scenario: Sync all hidden when fully synced
- **WHEN** every listed workout is `synced`
- **THEN** Sync all is not offered as an active action

### Requirement: Pull-to-refresh inventory
The Recent workouts list SHALL support pull-to-refresh. Refresh SHALL re-read on-device workouts and re-fetch Coach Watts match candidates, then redraw statuses. Refresh MUST NOT automatically upload workouts.

#### Scenario: Pull to refresh
- **WHEN** the athlete pull-to-refreshes the list
- **THEN** on-device workouts and remote match status are reloaded without uploading

### Requirement: Distinct from Sync history
Recent workouts SHALL remain workout-only and phone-first. Sync history SHALL continue to cover wellness days and ledger attempt history; this surface MUST NOT replace Sync history.

#### Scenario: Both entries available
- **WHEN** Sync to Coach Watts is enabled and the athlete is on Health Sync
- **THEN** both Sync history and Recent workouts remain reachable

