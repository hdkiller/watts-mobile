# connected-apps-lite Specification

## Purpose
TBD - created by archiving change connected-apps-lite. Update Purpose after archive.
## Requirements
### Requirement: Connected Apps lite screen
The companion SHALL provide an in-app Connected Apps lite screen under Settings that lists a curated set of Coach Watts integrations with connection status. The screen MUST NOT implement native provider OAuth authorize/callback flows.

#### Scenario: Open from Settings
- **WHEN** the authenticated user chooses Connected Apps in Settings
- **THEN** the app navigates to the Connected Apps lite screen

#### Scenario: Curated providers shown when none connected
- **WHEN** the status API returns no matching integrations for the curated providers
- **THEN** the screen still lists each curated provider as Not connected with a Connect action

### Requirement: Status from Coach Watts API
The Connected Apps lite screen SHALL load integration status from the Coach Watts integrations status endpoint using the companion Bearer token. The client MUST NOT display provider access tokens or other secrets from the response.

#### Scenario: Connected provider detail
- **WHEN** a curated provider has a matching integration row with a successful or authorized sync status
- **THEN** the row shows Connected and, when available, a last-sync timestamp

#### Scenario: Failed provider detail
- **WHEN** a curated provider has a matching integration row with a failed sync status or error message
- **THEN** the row surfaces an error/fix affordance and enough detail for the athlete to understand reconnect is needed

#### Scenario: Status unavailable
- **WHEN** the status request fails (network, 401/403/404/5xx)
- **THEN** the screen shows an honest error state and offers Open Connected Apps on web via instance handoff

### Requirement: Connect Fix Manage via web handoff
Connect, Fix, and Manage actions on Connected Apps lite SHALL open the instance Connected Apps web surface using the existing app→web session handoff helper. Native disconnect, sync-now, and ingest preference editors MUST NOT be implemented on this screen.

#### Scenario: Connect not-connected provider
- **WHEN** the athlete taps Connect on a Not connected curated provider
- **THEN** the app opens the web Connected Apps path via handoff (falling back to bare URL if handoff mint fails)

#### Scenario: Manage connected provider
- **WHEN** the athlete taps Manage on a connected curated provider
- **THEN** the app opens the web Connected Apps path via handoff

#### Scenario: Fix errored provider
- **WHEN** the athlete taps Fix on a provider in an error state
- **THEN** the app opens the web Connected Apps path via handoff

#### Scenario: Manage all footer
- **WHEN** the athlete chooses Manage all Connected Apps
- **THEN** the app opens the web Connected Apps path via handoff

### Requirement: Health Sync distinguished on the same screen
Connected Apps lite SHALL present Health Sync as a separate “on this phone” path (summary + navigation to the existing Health Sync settings screen), distinct from Coach Watts Connected Apps server integrations.

#### Scenario: Health Sync band
- **WHEN** the athlete opens Connected Apps lite
- **THEN** they see a Health Sync entry separate from the curated provider list and can open the Health Sync settings screen from it

### Requirement: Refetch after returning from browser
After the athlete returns to the app from a Connect/Fix/Manage browser session, Connected Apps lite SHALL refresh integration status so newly completed connections appear without requiring a manual app restart.

#### Scenario: Focus refresh
- **WHEN** the Connected Apps lite screen is focused again after the athlete left to complete a web connect
- **THEN** the app refetches integration status and updates row states

### Requirement: Optional Today connect cue when none connected
When integration status is available and no curated provider is connected, Today MAY show a single secondary Connect a device cue that navigates to Connected Apps lite. The cue MUST NOT replace the recommendation hero or block the daily loop.

#### Scenario: Zero connections cue
- **WHEN** Today loads, status is available, and zero curated providers are connected
- **THEN** Today may show one secondary Connect a device action that opens Connected Apps lite

