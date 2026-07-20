# recommendation-actions Specification

## Purpose
TBD - created by archiving change phase-1-today-loop. Update Purpose after archive.
## Requirements
### Requirement: Accept recommendation
The Today surface SHALL provide an Accept action that calls the coach-wattz accept endpoint for the current activity recommendation when the backend accepts Bearer tokens.

#### Scenario: Successful accept
- **WHEN** the user taps Accept and the API succeeds
- **THEN** Today refreshes and the UI reflects the accepted state

### Requirement: Rest or skip
The Today surface SHALL provide a Rest/Skip action that updates the recommendation through the same server path the web app uses for declining or resting, once that path supports Bearer auth.

#### Scenario: Rest/skip completes
- **WHEN** the user confirms Rest/Skip and the API succeeds
- **THEN** Today refreshes and no longer treats the recommendation as pending acceptance

### Requirement: Disable actions when unavailable
CTAs SHALL be disabled or hidden when there is no recommendation, when already accepted, or when the required mutation API is unavailable.

#### Scenario: Already accepted
- **WHEN** the recommendation is already accepted
- **THEN** Accept is not offered as a primary pending action

### Requirement: Backend Bearer support prerequisite
Recommendation mutation endpoints used by the app MUST authenticate via the same Bearer/`requireAuth` path as `GET /api/recommendations/today` (coach-wattz change).

#### Scenario: Accept with Bearer
- **WHEN** the mobile client POSTs accept with a valid Bearer token and required scopes
- **THEN** the server authorizes the user without a browser session cookie

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

