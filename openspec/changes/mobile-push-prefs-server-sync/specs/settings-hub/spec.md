## MODIFIED Requirements

### Requirement: Existing device preferences remain under Settings
Settings SHALL continue to host push notification preferences, Health Sync connect/status, and Instance URL display/change-via-sign-out. Push notification preferences SHALL be server-backed when `GET/PUT /api/mobile/devices/preferences` is available, and MUST NOT offer Sync Status as an active OS-push toggle.

#### Scenario: Notifications from Settings
- **WHEN** the user chooses Notifications in Settings
- **THEN** the app opens the in-app push preference toggles screen

#### Scenario: Server-backed toggles
- **WHEN** the prefs API is available
- **THEN** Daily Recommendation, Workout Analysis, and Coach Messages toggles load from and save to the server

#### Scenario: Sync Status not offered
- **WHEN** the user views Notification settings
- **THEN** Sync Status is not presented as an enabled control for `SYNC_COMPLETED` OS pushes

#### Scenario: Health Sync from Settings
- **WHEN** the user chooses Health Sync in Settings
- **THEN** the app opens the Health Sync status/connect screen

#### Scenario: Instance from Settings
- **WHEN** the user chooses Instance in Settings
- **THEN** the active instance URL is shown and changing instance requires sign-out
