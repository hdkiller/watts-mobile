# athlete-profile-edit Specification

## Purpose
TBD - created by archiving change phase-4-athlete-profile-edit. Update Purpose after archive.
## Requirements
### Requirement: Athlete metrics entry from More
The system SHALL provide an Athlete destination reachable from More where the authenticated user can view the Athlete profile overview (identity, HR thresholds, AI summary when available) and view and edit core athlete metrics.

#### Scenario: Open Athlete from More
- **WHEN** the authenticated user opens More and chooses Athlete (or Athlete profile)
- **THEN** the app navigates to the Athlete screen that includes the profile overview and metrics editing

### Requirement: Load athlete metrics
The Athlete screen SHALL load current metrics via `GET /api/profile` using Bearer `profile:read` (or broader authenticated access that includes profile read). Overview identity and HR readouts MAY use the same payload and/or `GET /api/profile/dashboard` when needed for resting HR or age.

#### Scenario: Metrics load
- **WHEN** the Athlete screen opens and the request succeeds
- **THEN** the user sees current weight, FTP, max HR, and LTHR when the API provides them

#### Scenario: Load error
- **WHEN** the profile request fails
- **THEN** the user sees a recoverable error state with retry

### Requirement: Save athlete metrics
The Athlete screen SHALL save edits via `PATCH /api/profile` using Bearer `profile:write` for the fields weight, FTP, max HR, and LTHR.

#### Scenario: Successful save
- **WHEN** the user changes one or more of those fields and saves successfully
- **THEN** the client persists the change to the server and confirms success in the UI

#### Scenario: Validation or save error
- **WHEN** the save request fails
- **THEN** the user sees an error message and retained form values for correction

### Requirement: Open web for full settings
The Athlete screen SHALL clarify that More → Athlete edits **default-profile** core metrics (weight, FTP, max HR, LTHR), that **per-sport** lite threshold edits live on Settings → Sports, and SHALL still offer Open web for Profile Settings areas not on the companion (zones, detect-from-workouts, measurements, availability, Connected Apps).

#### Scenario: Open web from Athlete
- **WHEN** the user chooses Open web from Athlete
- **THEN** the system browser opens the configured instance (profile/settings path when known, otherwise instance home)

#### Scenario: Per-sport pointer
- **WHEN** the user views the Athlete metrics screen
- **THEN** helper copy or a link indicates that sport-specific thresholds are available under Settings → Sports

### Requirement: Overview above metrics editor
The Athlete screen SHALL present the Athlete profile overview above (or clearly before) the editable metrics form so identity and AI summary are visible without scrolling past a long form when space allows. Editing Max HR / LTHR MUST remain available via the existing metrics editor and MUST NOT require a second Profile Settings port.

#### Scenario: Overview and editor coexist
- **WHEN** the Athlete screen loads successfully
- **THEN** the athlete can see the overview block and can still edit weight, FTP, max HR, and LTHR on the same destination

### Requirement: Athlete metrics remain default-profile quick edit
Saving Athlete metrics SHALL continue to update the default sport profile / User fields via `PATCH /api/profile` without requiring the Sports editor.

#### Scenario: Quick FTP bump
- **WHEN** the user changes FTP on Athlete metrics and saves successfully
- **THEN** the change persists without opening Settings → Sports

