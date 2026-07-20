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
Tapping a workout SHALL open a summary stack screen with core fields (title, date, duration, load/TSS when present), optional lite summary metrics when present, and the AI analysis section when analysis data or status requires athlete attention. Deep charts/streams MAY still use Open web.

#### Scenario: Open summary
- **WHEN** the user taps a workout row
- **THEN** the app navigates to that workout’s summary screen

#### Scenario: Core fields still shown
- **WHEN** the summary screen loads successfully
- **THEN** the user sees title and available date/duration/load fields even if summary metrics or analysis are absent

#### Scenario: Analysis visible when ready
- **WHEN** the workout detail includes completed AI analysis content
- **THEN** the summary screen shows that analysis in-app rather than requiring Open web solely to read it

### Requirement: Web escape for deep analysis
The summary screen SHALL offer Open web (or equivalent) for map explorer depth, GPX, interval audit, and other analysis surfaces not implemented in-app, rather than porting those explorer surfaces. AI analysis write-up and scores are in-app per `activity-ai-analysis`. Stream/zone/power-curve charts are in-app per `activity-charts`. The lite interactive route map is in-app per `activity-workout-map`.

#### Scenario: Open web from summary
- **WHEN** the user chooses Open web from activity summary
- **THEN** the system browser opens the instance URL for that workout or the instance home if a specific URL is unavailable

#### Scenario: Route map does not require Open web
- **WHEN** the workout has GPS coordinates and the athlete views activity summary
- **THEN** they can see the lite in-app route map without using Open web solely for the route

### Requirement: Today Recently entry point
Recent activity SHALL be reachable from a thin Recently teaser on the Today tab that reuses the same recent-activity query (`GET /api/workouts` with Bearer `workout:read`) and deep-links “See all” into the existing Recent activity list screen.

#### Scenario: See all from Today
- **WHEN** the user taps See all on Today’s Recently teaser
- **THEN** the app navigates to the Recent activity list screen

#### Scenario: Shared query cache
- **WHEN** Today loads the Recently teaser
- **THEN** it uses the same recent-activity query key/contract as the Recent activity screen (no separate invent endpoint)

### Requirement: Lite activity summary metrics
The lite activity summary screen SHALL show a compact summary of completed-workout metrics when `GET /api/workouts/:id?includeStreams=false` includes them, without loading streams or porting analysis charts.

Displayed metrics MAY include distance (`distanceMeters`), average power (`averageWatts`), normalized power (`normalizedPower`), average heart rate (`averageHr`), elevation gain (`elevationGain`), and intensity factor (`intensity`) when each value is present and finite. The system MUST omit individual metrics that are absent and MUST omit the entire summary-metrics section when none are present. The system MUST NOT invent placeholder zeros.

#### Scenario: Metrics present
- **WHEN** the workout payload includes one or more of distance, average/normalized power, average HR, elevation, or intensity
- **THEN** the summary screen shows those present metrics in a compact labeled layout

#### Scenario: Metrics absent
- **WHEN** the workout payload has none of the summary metric fields
- **THEN** the summary screen does not show an empty metrics section

#### Scenario: Streams remain off
- **WHEN** the app loads activity summary
- **THEN** it requests the workout with `includeStreams=false` (or equivalent) and does not render stream charts

