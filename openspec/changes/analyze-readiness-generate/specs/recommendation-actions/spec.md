## ADDED Requirements

### Requirement: Generate is distinct from Accept and Rest
Analyze Readiness generate SHALL NOT replace Accept or Rest/Skip. Generate creates or refreshes today’s recommendation; Accept and Rest remain the decision actions once a recommendation exists.

#### Scenario: After generate completes
- **WHEN** a new recommendation is loaded after Analyze Readiness
- **THEN** Accept and Rest/Skip remain available per existing recommendation-actions rules

### Requirement: Backend Bearer support for generate
`POST /api/recommendations/today` and `GET /api/recommendations/status` used by the app MUST authenticate via the same Bearer/`requireAuth` path as `GET /api/recommendations/today` (coach-wattz change), with scopes documented for the Official Mobile App.

#### Scenario: Generate with Bearer
- **WHEN** the mobile client POSTs generate with a valid Bearer token and required scopes
- **THEN** the server authorizes the user without a browser session cookie
