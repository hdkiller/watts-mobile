## MODIFIED Requirements

### Requirement: Settings hub sections
The Settings hub SHALL group preferences into General, Coach, and Account sections without porting full web Profile Settings or `/settings` control-room tabs.

#### Scenario: General section contents
- **WHEN** the user opens Settings
- **THEN** General includes Notifications, Health Sync, Connected Apps lite, Units & locale, and Instance

#### Scenario: Coach section contents
- **WHEN** the user opens Settings
- **THEN** Coach includes an entry for Coach identity (persona / nickname / About me / tool approval)

#### Scenario: Account section contents
- **WHEN** the user opens Settings
- **THEN** Account includes Subscription & Billing, Athlete metrics (or a link to that screen), Export my data, Delete account, and Open web Profile Settings

### Requirement: No full Profile Settings port
Settings MUST NOT implement Sport zones, Availability, Measurements history, Public Presence, Developer/API keys, Danger Zone bulk-wipe actions, full Connected Apps control-room editors, invoice history, payment-method editing, tax documents, refunds, or provider administration. A Connected Apps lite status/handoff surface and native Subscription & Billing purchase/status/restore/manage surface are allowed.

#### Scenario: Control-room settings stay on web or provider portal
- **WHEN** the user needs Sport zones, Availability, Connected Apps sync/ingest/conflict controls, invoices, payment-method editing, tax documents, refunds, or developer settings
- **THEN** Settings opens the appropriate authenticated web or payment-provider destination rather than implementing those editors natively

