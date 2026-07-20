## ADDED Requirements

### Requirement: Complete planned workout from detail
The planned workout detail screen SHALL offer a Complete action that calls `POST /api/planned-workouts/:id/complete` with Bearer auth and an appropriate write scope. On success, the system SHALL refresh planned detail (and related Today / upcoming caches) so completion status is honest. The system MUST NOT invent a completed activity link when the API does not return one.

#### Scenario: Complete succeeds
- **WHEN** the user confirms Complete on a planned workout that is not already completed
- **THEN** the client posts complete for that id and the detail screen shows the updated completion status from the server

#### Scenario: Complete fails
- **WHEN** the complete request fails
- **THEN** the user sees an error and can retry, and local status MUST NOT show completed unless the server confirmed it

#### Scenario: Already completed
- **WHEN** the planned workout is already completed
- **THEN** the Complete action is unavailable or no-ops without issuing a redundant success state

### Requirement: Skip planned workout from detail
The planned workout detail screen SHALL offer a Skip action that updates planned completion via the coach-wattz-agreed skip/miss contract (PATCH `completionStatus` or dedicated endpoint) with Bearer auth. On success, caches SHALL refresh so status is honest. Until the skip contract is confirmed, the Skip control MUST NOT call an invented endpoint.

#### Scenario: Skip succeeds
- **WHEN** the skip API contract is available and the user confirms Skip
- **THEN** the client applies the agreed mutation and the detail screen shows the updated skipped/missed status from the server

#### Scenario: Skip contract unavailable
- **WHEN** the skip API shape is not yet available on the instance
- **THEN** the app MUST NOT present a Skip control that pretends to succeed client-side

### Requirement: Compliance distinct from recommendation actions
Planned Complete and Skip SHALL be separate from recommendation Accept and Rest. Completing or skipping a planned workout MUST NOT call recommendation accept/rest endpoints.

#### Scenario: No recommendation mutation
- **WHEN** the user completes or skips a planned workout
- **THEN** the client does not invoke recommendation accept or rest APIs as part of that action

### Requirement: Today planned-only hero parity
When Today shows a planned-only hero (no recommendation), the system SHALL expose the same Complete and Skip capabilities (subject to skip-contract availability) that planned detail exposes, routing into the same mutations.

#### Scenario: Complete from planned-only Today
- **WHEN** Today is in planned-only hero mode and the user completes the planned workout
- **THEN** the same complete API is used and Today refreshes to reflect the new status
