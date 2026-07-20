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

