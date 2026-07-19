## ADDED Requirements

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
