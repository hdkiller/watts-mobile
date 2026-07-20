## ADDED Requirements

### Requirement: Settings entry from More
The More tab SHALL provide a Settings entry that opens the in-app Settings hub. Notification preferences and Instance confirmation MUST be reachable from Settings (Instance MAY also remain visible elsewhere).

#### Scenario: Open Settings from More
- **WHEN** the authenticated user opens More and chooses Settings
- **THEN** the app navigates to the Settings hub

### Requirement: Settings hub sections
The Settings hub SHALL group preferences into General, Coach, and Account sections without porting full web Profile Settings or `/settings` control-room tabs.

#### Scenario: General section contents
- **WHEN** the user opens Settings
- **THEN** General includes Notifications, Health Sync, Units & locale, and Instance

#### Scenario: Coach section contents
- **WHEN** the user opens Settings
- **THEN** Coach includes an entry for Coach identity (persona / nickname / About me / tool approval)

#### Scenario: Account section contents
- **WHEN** the user opens Settings
- **THEN** Account includes Athlete metrics (or a link to that screen), Export my data, Delete account, and Open web Profile Settings

### Requirement: Existing device preferences remain under Settings
Settings SHALL continue to host push notification preferences, Health Sync connect/status, and Instance URL display/change-via-sign-out.

#### Scenario: Notifications from Settings
- **WHEN** the user chooses Notifications in Settings
- **THEN** the app opens the in-app push preference toggles screen

#### Scenario: Health Sync from Settings
- **WHEN** the user chooses Health Sync in Settings
- **THEN** the app opens the Health Sync status/connect screen

#### Scenario: Instance from Settings
- **WHEN** the user chooses Instance in Settings
- **THEN** the active instance URL is shown and changing instance requires sign-out

### Requirement: No full Profile Settings port
Settings MUST NOT implement Sport zones, Availability, Measurements history, Public Presence, Connected Apps, Billing, Developer/API keys, or Danger Zone bulk-wipe actions. Those remain Open web destinations.

#### Scenario: Control-room settings stay on web
- **WHEN** the user needs Sport, Availability, Connected Apps, or Billing settings
- **THEN** Settings offers Open web Profile / web settings rather than native editors for those surfaces
