## MODIFIED Requirements

### Requirement: Request least-privilege scopes including offline access
The authorization request SHALL include at least `profile:read`, `workout:read`, `health:read`, `health:write`, `offline_access`, recommendation/planning read scopes when available, and `chat:read` plus `chat:write` when the Official Mobile App client is allowed to request them.

#### Scenario: Offline access requested
- **WHEN** the user starts login
- **THEN** the authorize URL includes `offline_access` in the scope list

#### Scenario: Chat scopes requested
- **WHEN** the user starts login and chat scopes are enabled for the mobile client
- **THEN** the authorize URL includes `chat:read` and `chat:write`
