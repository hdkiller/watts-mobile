# ad-hoc-workout Specification

## Purpose
TBD - created by archiving change ad-hoc-workout-generate. Update Purpose after archive.
## Requirements
### Requirement: Ad-hoc workout form
The app SHALL provide a Generate Ad-Hoc Workout sheet with fields for activity type (Ride, Run, Swim, WeightTraining), duration in minutes, intensity (Recovery, Endurance, Tempo, Threshold, VO2Max, Anaerobic), and optional instructions/focus notes, matching the web ad-hoc modal contract.

#### Scenario: Defaults
- **WHEN** the user opens the sheet
- **THEN** type defaults to Ride, duration to 60 minutes, intensity to Endurance, and notes empty

#### Scenario: Validation
- **WHEN** duration is missing or not greater than zero
- **THEN** Generate Workout does not submit

### Requirement: Generate mutation
Submitting the form SHALL call `POST /api/workouts/generate` with Bearer auth and body `{ type, durationMinutes, intensity, notes }`, then enter a generating state until completion, timeout, or failure.

#### Scenario: Authorized generate
- **WHEN** a valid access token with `workout:write` exists and the user taps Generate Workout
- **THEN** the client POSTs to `/api/workouts/generate` with `Authorization: Bearer`

#### Scenario: Quota exceeded
- **WHEN** the API returns 429
- **THEN** the UI shows an honest quota message and offers Open web; it MUST NOT silently retry

### Requirement: Completion refreshes Today
On successful generation (status complete and/or new planned workout visible via refetch), the app SHALL refresh Today (and planned-for-today data as needed) so the new session appears. The app MUST NOT invent a local planned workout card before server confirmation.

#### Scenario: Workout appears after generate
- **WHEN** generation completes and today/planned refetch returns the new planned workout
- **THEN** Today shows that planned workout in the hero or planned summary

#### Scenario: Timeout
- **WHEN** generation does not complete within the client timeout window
- **THEN** the UI shows a timeout/error with Retry and stops the spinner

