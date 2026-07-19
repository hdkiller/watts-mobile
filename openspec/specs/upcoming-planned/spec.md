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
When the planned workout payload includes structure data, the planned detail screen SHALL present a compact summary of that structure in addition to title and key metrics.

For endurance-shaped payloads, structure means top-level interval/step data (`structuredWorkout.steps` or `intervals`): at least name and duration when present. When at least two of those steps carry positive durations, the screen SHALL additionally render a compact graphical intensity profile above the step list — block width proportional to step duration, block height/color derived from step intensity via the shared zone ramp, with a neutral fill for steps whose intensity cannot be confidently determined.

For strength-shaped payloads, structure means canonical `structuredWorkout.blocks` (preferred) or legacy `exercises`: the screen SHALL list exercises with name and a compact prescription summary when present (sets, reps/value, load, rest). The system MUST NOT invent exercises or prescription values when those fields are absent. The intensity-profile graphic MUST NOT be shown for strength-shaped structure.

#### Scenario: Endurance structure present
- **WHEN** the planned workout detail includes interval or step structure
- **THEN** the detail screen shows a compact structure summary

#### Scenario: Intensity profile rendered
- **WHEN** two or more endurance structure steps have positive durations
- **THEN** a horizontal intensity-profile graphic appears above the step list with block widths proportional to duration

#### Scenario: Unparseable intensity stays honest
- **WHEN** an endurance step's intensity cannot be confidently parsed
- **THEN** its profile block uses a neutral color and mid height rather than an invented zone

#### Scenario: Strength blocks present
- **WHEN** the planned workout `structuredWorkout` includes non-empty `blocks` with exercise steps
- **THEN** the detail screen shows those exercises with names and compact prescription text when available

#### Scenario: Strength exercises fallback
- **WHEN** `blocks` are absent but `structuredWorkout.exercises` is a non-empty array
- **THEN** the detail screen shows a compact exercise list from that array

#### Scenario: Strength has no intensity profile
- **WHEN** the mapped structure comes from strength `blocks` or `exercises`
- **THEN** the detail screen does not render the duration×intensity profile graphic

#### Scenario: Structure absent
- **WHEN** the planned workout has no structure fields
- **THEN** the detail screen still shows available title/metrics/description and MUST NOT invent intervals or exercises

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

### Requirement: Today Coming up entry point
Upcoming planned workouts SHALL be reachable from a thin Coming up teaser on the Today tab that reuses the same upcoming planned query (`GET /api/planned-workouts` with Bearer `workout:read`) and deep-links “See all” into the existing Upcoming list screen.

#### Scenario: See all from Today
- **WHEN** the user taps See all on Today’s Coming up strip
- **THEN** the app navigates to the Upcoming planned list screen

#### Scenario: Shared query cache
- **WHEN** Today loads the Coming up teaser
- **THEN** it uses the same upcoming-planned query key/contract as the Upcoming screen (no separate invent endpoint)

### Requirement: Planned intensity and status on detail
The planned workout detail screen SHALL show planned intensity (`workIntensity`) when present and finite, and SHALL show honest completion/sync status labels when `completionStatus` and/or `syncStatus` are present on `GET /api/planned-workouts/:id`. The system MUST NOT invent status progress the server did not supply.

#### Scenario: Intensity present
- **WHEN** the planned workout includes a finite `workIntensity`
- **THEN** the detail screen shows it as a compact intensity/IF label alongside other key metrics

#### Scenario: Status present
- **WHEN** the planned workout includes completion or sync status fields
- **THEN** the detail screen displays corresponding human-readable status text

#### Scenario: Intensity or status absent
- **WHEN** intensity or status fields are missing
- **THEN** the detail screen omits those labels rather than showing placeholders

### Requirement: Planned coach cues
When `structuredWorkout.coachInstructions` is a non-empty string, the planned detail screen SHALL show a short Coach cues section with that text (truncated for display if very long). The system MUST NOT invent coach cues when the field is absent or non-string.

#### Scenario: Coach instructions present
- **WHEN** the planned workout structured payload includes non-empty `coachInstructions`
- **THEN** the detail screen shows a Coach cues section with that text

#### Scenario: Coach instructions absent
- **WHEN** `coachInstructions` is missing or empty
- **THEN** the detail screen does not show a Coach cues section

### Requirement: Compact planned zone summary
When `structuredWorkout.zoneProfileSnapshot` includes zone ranges, the planned detail screen SHALL show a compact zone summary for one primary channel (preferring power, then heart rate, then pace) with named ranges and min–max values. The system MUST NOT invent zones when the snapshot is absent or empty, and MUST NOT render zone charts.

#### Scenario: Zone snapshot present
- **WHEN** the structured workout includes a zone profile snapshot with ranges
- **THEN** the detail screen shows a compact text list of those zones for a primary channel

#### Scenario: Zone snapshot absent
- **WHEN** the structured workout has no zone profile snapshot or empty ranges
- **THEN** the detail screen does not show a zones section

