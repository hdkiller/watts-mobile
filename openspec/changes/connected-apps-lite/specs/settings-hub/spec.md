## MODIFIED Requirements

### Requirement: Settings hub sections
The Settings hub SHALL group preferences into General, Coach, and Account sections without porting full web Profile Settings or `/settings` control-room tabs (Billing, Developer, Danger Zone, full Connected Apps editors).

#### Scenario: General section contents
- **WHEN** the user opens Settings
- **THEN** General includes Notifications, Health Sync, Connected Apps, Units & locale, and Instance

#### Scenario: Coach section contents
- **WHEN** the user opens Settings
- **THEN** Coach includes an entry for Coach identity (persona / nickname / About me / tool approval)

#### Scenario: Account section contents
- **WHEN** the user opens Settings
- **THEN** Account includes Athlete metrics (or a link to that screen), Export my data, Delete account, and Open web Profile Settings

### Requirement: Existing device preferences remain under Settings
Settings SHALL continue to host push notification preferences, Health Sync connect/status, Connected Apps lite status, and Instance URL display/change-via-sign-out.

#### Scenario: Notifications from Settings
- **WHEN** the user chooses Notifications in Settings
- **THEN** the app opens the in-app push preference toggles screen

#### Scenario: Health Sync from Settings
- **WHEN** the user chooses Health Sync in Settings
- **THEN** the app opens the Health Sync status/connect screen

#### Scenario: Connected Apps from Settings
- **WHEN** the user chooses Connected Apps in Settings
- **THEN** the app opens the Connected Apps lite status screen

#### Scenario: Instance from Settings
- **WHEN** the user chooses Instance in Settings
- **THEN** the active instance URL is shown and changing instance requires sign-out

### Requirement: No full Profile Settings port
Settings MUST NOT implement Sport zones, Availability, Measurements history, Public Presence, Billing, Developer/API keys, Danger Zone bulk-wipe actions, or full Connected Apps control-room editors (disconnect, sync-now, ingest toggles, source conflicts). Those remain Open web destinations. A Connected Apps lite status surface with handoff actions is allowed.

#### Scenario: Control-room settings stay on web
- **WHEN** the user needs Sport zones, Availability, Billing, or Connected Apps sync/ingest/conflict controls
- **THEN** Settings offers Open web / handoff rather than native editors for those control-room surfaces

#### Scenario: Connected Apps lite is in-app
- **WHEN** the user needs to see whether Garmin/Oura/etc. are connected or start a connect flow
- **THEN** Settings provides Connected Apps lite in-app and uses web handoff for Connect/Fix/Manage
