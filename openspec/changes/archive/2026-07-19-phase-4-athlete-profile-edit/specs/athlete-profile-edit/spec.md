## ADDED Requirements

### Requirement: Athlete metrics entry from More
The system SHALL provide an Athlete destination reachable from More where the authenticated user can view and edit core athlete metrics.

#### Scenario: Open Athlete from More
- **WHEN** the authenticated user opens More and chooses Athlete
- **THEN** the app navigates to the Athlete metrics screen

### Requirement: Load athlete metrics
The Athlete screen SHALL load current metrics via `GET /api/profile` using Bearer `profile:read` (or broader authenticated access that includes profile read).

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
The Athlete screen SHALL offer Open web (or equivalent) for settings beyond the metrics subset rather than porting full Profile Settings.

#### Scenario: Open web from Athlete
- **WHEN** the user chooses Open web from Athlete
- **THEN** the system browser opens the configured instance (profile/settings path when known, otherwise instance home)
