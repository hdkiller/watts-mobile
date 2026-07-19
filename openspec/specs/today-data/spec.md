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

