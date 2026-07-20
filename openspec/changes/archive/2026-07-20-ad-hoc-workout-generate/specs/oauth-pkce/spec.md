## ADDED Requirements

### Requirement: Ad-hoc generate requires workout write scope
`POST /api/workouts/generate` used by the companion MUST authenticate via Bearer/`requireAuth` with `workout:write` (already included in the Official Mobile App / companion scope list). The mobile client MUST NOT call the endpoint when the access token lacks that scope.

#### Scenario: Bearer generate authorized
- **WHEN** the mobile client POSTs ad-hoc generate with a valid Bearer token that includes `workout:write`
- **THEN** the server authorizes the user without a browser session cookie
