## MODIFIED Requirements

### Requirement: Open web for full settings
The Athlete screen SHALL clarify that More → Athlete edits **default-profile** core metrics (weight, FTP, max HR, LTHR), that **per-sport** lite threshold edits live on Settings → Sports, and SHALL still offer Open web for Profile Settings areas not on the companion (zones, detect-from-workouts, measurements, availability, Connected Apps).

#### Scenario: Open web from Athlete
- **WHEN** the user chooses Open web from Athlete
- **THEN** the system browser opens the configured instance (profile/settings path when known, otherwise instance home)

#### Scenario: Per-sport pointer
- **WHEN** the user views the Athlete metrics screen
- **THEN** helper copy or a link indicates that sport-specific thresholds are available under Settings → Sports

## ADDED Requirements

### Requirement: Athlete metrics remain default-profile quick edit
Saving Athlete metrics SHALL continue to update the default sport profile / User fields via `PATCH /api/profile` without requiring the Sports editor.

#### Scenario: Quick FTP bump
- **WHEN** the user changes FTP on Athlete metrics and saves successfully
- **THEN** the change persists without opening Settings → Sports
