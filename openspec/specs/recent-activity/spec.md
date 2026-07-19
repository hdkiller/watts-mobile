# recent-activity Specification

## Purpose
TBD - created by archiving change phase-3-recent-activity. Update Purpose after archive.
## Requirements
### Requirement: Recent activity list
The system SHALL show a capped list of recent workouts via `GET /api/workouts` with Bearer `workout:read`, reachable from More.

#### Scenario: List loads
- **WHEN** the authenticated user opens Recent activity
- **THEN** they see up to N recent workouts with title/date (and type when available)

#### Scenario: Empty list
- **WHEN** the API returns no workouts
- **THEN** the user sees an honest empty state

### Requirement: Sync or analysis status
Each list row SHALL show an honest sync/analysis status when the API provides it, without inventing progress the server did not supply.

#### Scenario: Status present
- **WHEN** a workout includes analysis or sync status fields
- **THEN** the row displays a corresponding human-readable status

### Requirement: Lite activity summary
Tapping a workout SHALL open a lite summary stack screen with core fields (title, date, duration, load/TSS when present).

#### Scenario: Open summary
- **WHEN** the user taps a workout row
- **THEN** the app navigates to that workout’s summary screen

### Requirement: Web escape for deep analysis
The summary screen SHALL offer Open web (or equivalent) for deeper analysis rather than porting explorer UI.

#### Scenario: Open web from summary
- **WHEN** the user chooses Open web from activity summary
- **THEN** the system browser opens the instance URL for that workout or the instance home if a specific URL is unavailable

