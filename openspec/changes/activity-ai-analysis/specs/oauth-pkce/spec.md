## MODIFIED Requirements

### Requirement: Request least-privilege scopes including offline access
The authorization request SHALL include at least `profile:read`, `profile:write`, `workout:read`, `workout:write`, `health:read`, `health:write`, `nutrition:read`, `nutrition:write`, `offline_access`, and recommendation/planning read scopes when available, matching the product baseline for Phase 1 readiness, v1.5 field writes (athlete metrics + nutrition quick-log), and completed-workout AI analysis mutations.

#### Scenario: Offline access requested
- **WHEN** the user starts login
- **THEN** the authorize URL includes `offline_access` in the scope list

#### Scenario: Nutrition scopes requested
- **WHEN** the user starts login
- **THEN** the authorize URL includes `nutrition:read` and `nutrition:write` in the scope list

#### Scenario: Workout write scope requested
- **WHEN** the user starts login
- **THEN** the authorize URL includes `workout:write` in the scope list
