## MODIFIED Requirements

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

### Requirement: Open web for full settings
The Athlete screen SHALL offer Open web for settings beyond the metrics subset and for the full web Athlete Profile report rather than porting full Profile Settings or the full AI report page.

#### Scenario: Open web from Athlete
- **WHEN** the user chooses Open web from Athlete
- **THEN** the system browser opens the configured instance (Athlete Profile report path and/or profile/settings path when known, otherwise instance home)

## ADDED Requirements

### Requirement: Overview above metrics editor
The Athlete screen SHALL present the Athlete profile overview above (or clearly before) the editable metrics form so identity and AI summary are visible without scrolling past a long form when space allows. Editing Max HR / LTHR MUST remain available via the existing metrics editor and MUST NOT require a second Profile Settings port.

#### Scenario: Overview and editor coexist
- **WHEN** the Athlete screen loads successfully
- **THEN** the athlete can see the overview block and can still edit weight, FTP, max HR, and LTHR on the same destination
