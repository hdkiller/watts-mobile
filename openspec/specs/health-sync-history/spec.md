# health-sync-history Specification

## Purpose
TBD - created by archiving change health-platform-ingest. Update Purpose after archive.
## Requirements
### Requirement: Local sync ledger
The app SHALL maintain a local sync ledger of wellness-day and workout sync items with stable ids, kind, platform, human-readable title, status (`pending`, `syncing`, `synced`, `failed`, `needs_sync`), last attempt time, last success time, optional short error summary, attempt count, and optional remote workout id. Ledger entries MUST be updated as sync attempts start, succeed, or fail.

#### Scenario: Failed wellness day recorded
- **WHEN** a wellness upload for a date fails
- **THEN** the ledger stores that item with status `failed`, `lastAttemptAt`, and a short `lastError`

#### Scenario: Successful workout upload recorded
- **WHEN** a workout FIT upload succeeds
- **THEN** the ledger stores status `synced`, `lastSuccessAt`, and `remoteWorkoutId` when the API returns one

### Requirement: Sync history visible in Settings
Settings → Health Sync SHALL expose a Sync history surface listing ledger items newest-first so the athlete can see what data was sent (or attempted) and when. Each row SHALL show title, kind, status, and last attempt or success time.

#### Scenario: Open sync history
- **WHEN** the athlete opens Sync history from Health Sync
- **THEN** the app shows ledger items with per-item status

#### Scenario: Empty history
- **WHEN** sync has never produced ledger items
- **THEN** the history surface shows an honest empty state explaining that history appears after sync runs

### Requirement: Per-item retry
For items in `failed` or `needs_sync` status, the history surface SHALL offer a Retry (or equivalent) action that re-queues and re-attempts upload for that item only. The surface SHALL also offer a global Sync now action that runs a full sync pass.

#### Scenario: Retry failed wellness day
- **WHEN** the athlete taps Retry on a failed wellness ledger item
- **THEN** the app re-attempts `POST /api/wellness` for that date and updates the ledger from the result

#### Scenario: Retry needs-sync workout
- **WHEN** the athlete taps Retry on a workout marked `needs_sync`
- **THEN** the app re-attempts FIT upload for that platform session and updates the ledger from the result

#### Scenario: Sync now
- **WHEN** the athlete taps Sync now
- **THEN** the orchestrator runs a full due sync pass and refreshes history statuses

### Requirement: Workout presence gap surfaced
The ledger SHALL represent on-device workouts that are not confirmed present in Coach Watts as `needs_sync` (or `failed` after an unsuccessful attempt) so the athlete can see gaps and push again.

#### Scenario: Workout missing remotely
- **WHEN** a platform workout is discovered and no matching Coach Watts workout is found and no successful upload is recorded
- **THEN** the history row status is `needs_sync` or `failed` (not `synced`)

### Requirement: History filters for attention
The Sync history surface SHALL allow the athlete to focus on items that need attention (at least Failed and/or Needs sync), in addition to viewing all items.

#### Scenario: Filter failed
- **WHEN** the athlete filters history to Failed
- **THEN** only ledger items with status `failed` are shown

### Requirement: Ledger retention and sign-out
The app SHALL cap ledger retention to a documented recent window (wellness days and workout count) and SHALL clear or discard ledger contents on sign-out. Metric values themselves SHOULD not be retained in the ledger beyond what is needed for titles/status (no full sample payloads).

#### Scenario: Sign-out clears ledger
- **WHEN** the athlete signs out
- **THEN** local sync ledger history is cleared from the device

