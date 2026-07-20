## ADDED Requirements

### Requirement: Account deletion path reachable in-app
The app SHALL provide a clear in-app path to account deletion via Settings → Delete account that opens the web Danger Zone (or equivalent) using Open web / session handoff when available, without requiring the athlete to discover deletion only outside the app.

#### Scenario: Delete account from Settings
- **WHEN** the authenticated user chooses Delete account in Settings
- **THEN** the app opens the instance web destination where account deletion is performed

### Requirement: Data export path reachable in-app
The app SHALL provide a clear in-app path to export personal data via Settings → Export my data that opens the web export destination using Open web / session handoff when available.

#### Scenario: Export from Settings
- **WHEN** the authenticated user chooses Export my data in Settings
- **THEN** the app opens the instance web destination where data export is available
