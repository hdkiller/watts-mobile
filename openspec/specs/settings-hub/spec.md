# settings-hub Specification

## Purpose
TBD - created by archiving change settings-field-companion. Update Purpose after archive.
## Requirements
### Requirement: Settings entry from More
The More tab SHALL provide a Settings entry that opens the in-app Settings hub. Notification preferences and Instance confirmation MUST be reachable from Settings (Instance MAY also remain visible elsewhere).

#### Scenario: Open Settings from More
- **WHEN** the authenticated user opens More and chooses Settings
- **THEN** the app navigates to the Settings hub

### Requirement: Settings hub sections
The Settings hub SHALL group preferences into General, Coach, and Account sections without porting full web Profile Settings or `/settings` control-room tabs (billing administration, Developer, Danger Zone, full Connected Apps editors).

#### Scenario: General section contents
- **WHEN** the user opens Settings
- **THEN** General includes Notifications, Health Sync, Connected Apps, Units & locale, and Instance

#### Scenario: Coach section contents
- **WHEN** the user opens Settings
- **THEN** Coach includes an entry for Coach identity (persona / nickname / About me / tool approval)

#### Scenario: Account section contents
- **WHEN** the user opens Settings
- **THEN** Account includes Subscription & Billing lite (when implemented by its separate OpenSpec), Athlete metrics (or a link to that screen), Export my data, Delete account, and Open web Profile Settings

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

### Requirement: No full Profile Settings port
Settings MUST NOT implement Sport zones, Availability, Measurements history, Public Presence, billing administration (invoice history, payment methods, tax documents, refunds), Developer/API keys, Danger Zone bulk-wipe actions, or full Connected Apps control-room editors (disconnect, sync-now, ingest toggles, source conflicts). Those remain Open web/provider destinations. A Connected Apps lite status surface with handoff actions and the separate hosted Subscription & Billing purchase/status/restore/manage surface are allowed.

#### Scenario: Control-room settings stay on web
- **WHEN** the user needs Sport zones, Availability, billing administration, or Connected Apps sync/ingest/conflict controls
- **THEN** Settings offers Open web / handoff rather than native editors for those control-room surfaces

#### Scenario: Connected Apps lite is in-app
- **WHEN** the user needs to see whether Garmin/Oura/etc. are connected or start a connect flow
- **THEN** Settings provides Connected Apps lite in-app and uses web handoff for Connect/Fix/Manage

### Requirement: Health Sync links to Recent workouts
The Health Sync settings screen SHALL provide a navigation entry to Recent workouts so the athlete can inspect on-device HealthKit / Health Connect workouts and their Coach Watts sync status.

#### Scenario: Open Recent workouts from Health Sync
- **WHEN** the athlete chooses Recent workouts on the Health Sync screen
- **THEN** the app opens the Recent workouts list surface

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

