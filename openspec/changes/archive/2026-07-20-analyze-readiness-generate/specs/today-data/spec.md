## ADDED Requirements

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
