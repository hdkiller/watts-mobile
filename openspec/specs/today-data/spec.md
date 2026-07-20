# today-data Specification

## Purpose
TBD - created by archiving change phase-1-today-loop. Update Purpose after archive.
## Requirements
### Requirement: Fetch today’s recommendation with Bearer auth
The client SHALL load today’s activity recommendation via `GET /api/recommendations/today` using the authenticated API client.

#### Scenario: Authorized fetch
- **WHEN** a valid access token exists
- **THEN** the Today query calls `/api/recommendations/today` with `Authorization: Bearer`

### Requirement: Normalize into a Today view model
The client SHALL map API payloads into a stable Today view model used by the UI (recommendation, planned workout, recovery strip fields, action availability).

#### Scenario: Mapper isolates UI
- **WHEN** the API adds or renames nested analysis fields
- **THEN** UI components consume the view model rather than raw response shapes

### Requirement: Cache with TanStack Query
Today data SHALL be loaded through TanStack Query with pull-to-refresh support on the Today tab.

#### Scenario: Pull to refresh
- **WHEN** the user pulls to refresh on Today
- **THEN** the today query is invalidated and refetched

### Requirement: Generate today’s recommendation mutation
The client SHALL expose a mutation that POSTs to `/api/recommendations/today` via the authenticated API client and invalidates or refetches the Today recommendation query on success/completion.

#### Scenario: Authorized generate
- **WHEN** a valid access token exists and the user starts Analyze Readiness
- **THEN** the client calls `POST /api/recommendations/today` with `Authorization: Bearer`

### Requirement: Generation status helper
The client SHALL provide a helper/query to check generation status via `GET /api/recommendations/status` when available, accepting an optional job id from the generate response.

#### Scenario: Status with job id
- **WHEN** generate returns a job id
- **THEN** the status helper can query with that job id to learn whether the job is still running

### Requirement: Ad-hoc generate API helper
The client SHALL expose a mutation helper that POSTs to `/api/workouts/generate` via the authenticated API client and, on start/success/completion, invalidates or refetches Today and planned-for-today queries as needed.

#### Scenario: Authorized call
- **WHEN** a valid access token exists and the user starts ad-hoc generation
- **THEN** the client calls `POST /api/workouts/generate` with `Authorization: Bearer`

### Requirement: Ad-hoc completion observation
The client SHALL observe generation completion via a Bearer status helper when available and/or by refetching today/planned data on an interval until a new planned workout appears or the timeout elapses.

#### Scenario: Refetch fallback
- **WHEN** no status endpoint is available but generate returned success
- **THEN** the client still polls by refetching today/planned data until the workout appears or timeout

### Requirement: Map recommendation detail fields
The client SHALL map activity-recommendation `analysisJson` detail fields into a stable detail view model (or extended Today view model) including key factors, original planned workout summary, and suggested modifications (title, duration, TSS, description) for the recommendation detail sheet. UI MUST NOT depend on ad-hoc reads of nested raw keys outside the mapper.

#### Scenario: Key factors mapped
- **WHEN** `analysisJson.key_factors` is an array of strings
- **THEN** the detail view model exposes those factors for list rendering

#### Scenario: Original plan mapped
- **WHEN** `analysisJson.planned_workout` includes original title, duration, and TSS
- **THEN** the detail view model exposes those values for the Original Plan section

### Requirement: Refine uses generate mutation with optional feedback
The existing generate mutation SHALL accept optional `userFeedback` and be usable from both Analyze Readiness (empty state, typically no feedback) and Refine or Refresh (optional feedback). Success/completion SHALL invalidate or refetch the Today recommendation query.

#### Scenario: Refine with feedback
- **WHEN** Refine submits non-empty feedback
- **THEN** the client calls `POST /api/recommendations/today` with `{ userFeedback }` and Bearer auth

