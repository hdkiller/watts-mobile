## MODIFIED Requirements

### Requirement: Request least-privilege scopes including offline access
The authorization request SHALL include at least `profile:read`, `profile:write`, `workout:read`, `workout:write`, `health:read`, `health:write`, `nutrition:read`, `nutrition:write`, `offline_access`, recommendation/planning read scopes when available, and `goal:read` when event glances require it, matching the product baseline for companion field reads/writes including race/life event glances.

#### Scenario: Offline access requested
- **WHEN** the user starts login
- **THEN** the authorize URL includes `offline_access` in the scope list

#### Scenario: Nutrition scopes requested
- **WHEN** the user starts login
- **THEN** the authorize URL includes `nutrition:read` and `nutrition:write` in the scope list

#### Scenario: Workout write scope requested
- **WHEN** the user starts login
- **THEN** the authorize URL includes `workout:write` in the scope list

#### Scenario: Goal read scope for events
- **WHEN** the user starts login and event glances are in scope
- **THEN** the authorize URL includes `goal:read` (or the confirmed event-read scope) in the scope list
