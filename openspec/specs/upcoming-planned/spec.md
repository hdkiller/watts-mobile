# upcoming-planned Specification

## Purpose
TBD - created by archiving change phase-3-recent-activity. Update Purpose after archive.
## Requirements
### Requirement: Upcoming planned list
The system SHALL show a capped list of upcoming planned workouts via `GET /api/planned-workouts` with Bearer `workout:read`, using a bounded date window (approximately the next 7–14 days) and a limit, reachable from More.

#### Scenario: List loads
- **WHEN** the authenticated user opens Upcoming
- **THEN** they see upcoming planned workouts with title/date (and type, duration, or TSS when available)

#### Scenario: Empty list
- **WHEN** the API returns no upcoming planned workouts
- **THEN** the user sees an honest empty state

### Requirement: Open planned detail from Upcoming
Tapping an upcoming planned workout SHALL open the planned workout detail stack screen.

#### Scenario: Open planned detail
- **WHEN** the user taps an upcoming planned row
- **THEN** the app navigates to that planned workout’s detail screen

### Requirement: Richer planned structure summary
When the planned workout payload includes structure or interval/step data, the planned detail screen SHALL present a compact summary of those steps (at least name and duration when present) in addition to title and key metrics.

#### Scenario: Structure present
- **WHEN** the planned workout detail includes interval or step structure
- **THEN** the detail screen shows a compact structure summary

#### Scenario: Structure absent
- **WHEN** the planned workout has no structure fields
- **THEN** the detail screen still shows available title/metrics/description and MUST NOT invent intervals

### Requirement: Web escape for planned depth
The planned detail screen SHALL offer Open web (or equivalent) for deeper planned-workout analysis rather than porting plan architect UI.

#### Scenario: Open web from planned detail
- **WHEN** the user chooses Open web from planned detail
- **THEN** the system browser opens the instance URL for that planned workout or the instance home if a specific URL is unavailable

### Requirement: No calendar heatmap
Upcoming SHALL be a list (or simple day-grouped list), not a calendar heatmap or CTL visualization.

#### Scenario: No heatmap
- **WHEN** the user opens Upcoming
- **THEN** the UI does not present a calendar heatmap

