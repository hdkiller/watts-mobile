## MODIFIED Requirements

### Requirement: Open web escape hatch
The authenticated More (or Settings) surface SHALL offer an action that opens the configured Coach Watts instance in the system browser via the app→web session handoff when available (mint consume URL), falling back to the bare instance base URL if handoff mint fails.

#### Scenario: Open web from More
- **WHEN** the authenticated user chooses Open web
- **THEN** the system opens a handoff consume URL for the instance (or the instance base URL on handoff failure) in the system browser

#### Scenario: Open web lands signed in when handoff succeeds
- **WHEN** handoff mint and consume succeed
- **THEN** the browser session is authenticated as the same athlete without a second interactive login
