## MODIFIED Requirements

### Requirement: Settings hub sections
The Settings hub SHALL group preferences into Integrations & Data, App Preferences, Coaching & Sport, and Account sections without porting full web Profile Settings or `/settings` control-room tabs (billing administration, Developer, Danger Zone, full Connected Apps editors, nutrition planning/grocery).

#### Scenario: App Preferences section contents
- **WHEN** the user opens Settings
- **THEN** App Preferences includes Appearance, Notification preferences, Units & locale, Log defaults, and Nutrition

#### Scenario: Coach section contents
- **WHEN** the user opens Settings
- **THEN** Coaching & Sport includes Coach identity and Sports

#### Scenario: Account section contents
- **WHEN** the user opens Settings
- **THEN** Account & Billing / Account Management include Subscription & Billing lite, Instance, Export my data, Delete account, and Open web Profile Settings

### Requirement: No full Profile Settings port
Settings MUST NOT implement Sport zones, Availability, Measurements history, Public Presence, billing administration (invoice history, payment methods, tax documents, refunds), Developer/API keys, Danger Zone bulk-wipe actions, full Connected Apps control-room editors (disconnect, sync-now, ingest toggles, source conflicts), or nutrition planning/grocery. Those remain Open web/provider destinations. Connected Apps lite, hosted Subscription & Billing lite, Sports thresholds lite, and native Nutrition settings (Profile → Nutrition parity) are allowed.

#### Scenario: Control-room settings stay on web
- **WHEN** the user needs Sport zones, Availability, billing administration, Connected Apps sync/ingest/conflict controls, or nutrition planning/grocery
- **THEN** Settings offers Open web / handoff rather than native editors for those control-room surfaces

#### Scenario: Nutrition settings is in-app
- **WHEN** the user needs to edit Profile → Nutrition calibration fields
- **THEN** Settings provides Nutrition in-app and does not require Open Profile Settings for those fields

## ADDED Requirements

### Requirement: Nutrition from Settings
Settings SHALL host a Nutrition entry that opens the native Nutrition settings screen.

#### Scenario: Nutrition from Settings
- **WHEN** the user chooses Nutrition in Settings
- **THEN** the app opens the in-app Nutrition settings editor
