# log-recovery-event Specification

## Purpose
TBD - created by archiving change phase-2-log-recovery-event. Update Purpose after archive.
## Requirements
### Requirement: Log recovery event create flow
The system SHALL let an authenticated athlete create a manual recovery (journey) event with: what-happened option, severity (mild/moderate/severe), when (now / earlier today / yesterday / custom), and optional description (max 500 characters).

#### Scenario: Create illness event
- **WHEN** the user chooses Illness / sick, Moderate severity, Now, and saves
- **THEN** the client posts `category=FATIGUE`, `eventType=WELLNESS_CHECK`, `severity=6`, and a timestamp to `POST /api/recovery-context/journey` with `health:write`

#### Scenario: Description too long blocked
- **WHEN** the description exceeds 500 characters
- **THEN** save is blocked or the payload is truncated per API contract without crashing

### Requirement: Event taxonomy parity with web
The create UI SHALL offer the same what-happened options as web Log recovery event (illness, injury/pain, fatigue, poor sleep, mood/stress, GI, cramping, dizziness, hunger, general recovery note) mapped to the server `category` and `eventType` enums.

#### Scenario: General note mapping
- **WHEN** the user selects General recovery note
- **THEN** the payload uses `eventType=RECOVERY_NOTE` and an allowed category

### Requirement: Active recovery context on Log
The Log surface SHALL load recovery context via `GET /api/recovery-context` (`health:read`) and show items active for the athlete’s local today, distinguishing manual events from imported read-only items.

#### Scenario: Active manual event visible
- **WHEN** a journey event is active today
- **THEN** it appears in the Log recovery context list/chips

#### Scenario: Imported item read-only
- **WHEN** an item is imported (not editable)
- **THEN** the user can view it but cannot edit or delete it in-app

### Requirement: Edit and delete own journey events
For editable/deletable journey events, the system SHALL support update via `PATCH /api/recovery-context/journey/:id` and delete via `DELETE /api/recovery-context/journey/:id`.

#### Scenario: Delete confirmation
- **WHEN** the user deletes a manual journey event and confirms
- **THEN** the client calls DELETE and removes the item from the local list after success

### Requirement: Loading and error states
Recovery context load and save flows SHALL present loading and recoverable error states.

#### Scenario: Save failure
- **WHEN** create/update fails
- **THEN** the user sees an error message and can retry without losing entered fields when practical

