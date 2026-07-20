## ADDED Requirements

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
