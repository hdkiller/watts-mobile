## MODIFIED Requirements

### Requirement: Existing device preferences remain under Settings
Settings SHALL continue to host push notification preferences, Health Sync (connect/status, opt-in Sync to Coach Watts, sync history entry), and Instance URL display/change-via-sign-out.

#### Scenario: Notifications from Settings
- **WHEN** the user chooses Notifications in Settings
- **THEN** the app opens the in-app push preference toggles screen

#### Scenario: Health Sync from Settings
- **WHEN** the user chooses Health Sync in Settings
- **THEN** the app opens the Health Sync screen with connection status, the Sync to Coach Watts opt-in control, and access to Sync history

#### Scenario: Instance from Settings
- **WHEN** the user chooses Instance in Settings
- **THEN** the active instance URL is shown and changing instance requires sign-out

## ADDED Requirements

### Requirement: Health Sync controls auto upload
The Health Sync settings screen SHALL let the athlete enable or disable Sync to Coach Watts (wellness), show a nested Sync workouts sub-toggle when master sync is on, show whether automatic sync is on, and surface the time of the last successful sync when available.

#### Scenario: Toggle sync off
- **WHEN** the athlete turns off Sync to Coach Watts
- **THEN** the Health Sync screen reflects sync disabled and automatic uploads stop

#### Scenario: Workouts sub-toggle visible when master on
- **WHEN** Sync to Coach Watts is on
- **THEN** the Health Sync screen shows a Sync workouts control the athlete can turn off independently

#### Scenario: Last successful sync shown
- **WHEN** at least one sync item has succeeded
- **THEN** Health Sync shows a last-successful-sync timestamp
