## MODIFIED Requirements

### Requirement: Existing device preferences remain under Settings
Settings SHALL continue to host push notification preferences, Health Sync connect/status (including entries to Sync history and Recent workouts), and Instance URL display/change-via-sign-out.

#### Scenario: Notifications from Settings
- **WHEN** the user chooses Notifications in Settings
- **THEN** the app opens the in-app push preference toggles screen

#### Scenario: Health Sync from Settings
- **WHEN** the user chooses Health Sync in Settings
- **THEN** the app opens the Health Sync status/connect screen with access to Sync history and Recent workouts

#### Scenario: Instance from Settings
- **WHEN** the user chooses Instance in Settings
- **THEN** the active instance URL is shown and changing instance requires sign-out

## ADDED Requirements

### Requirement: Health Sync links to Recent workouts
The Health Sync settings screen SHALL provide a navigation entry to Recent workouts so the athlete can inspect on-device HealthKit / Health Connect workouts and their Coach Watts sync status.

#### Scenario: Open Recent workouts from Health Sync
- **WHEN** the athlete chooses Recent workouts on the Health Sync screen
- **THEN** the app opens the Recent workouts list surface
