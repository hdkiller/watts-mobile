## ADDED Requirements

### Requirement: Server-backed push preferences
When `GET /api/mobile/devices/preferences` is available, the client SHALL load push preference toggles from that endpoint (Bearer `profile:read`) and treat the response as authoritative for Settings. The client MAY cache the last successful response locally for offline display. Client defaults for a cold cache MUST match server defaults, including `SYNC_COMPLETED` false.

#### Scenario: Prefs load from server
- **WHEN** the authenticated user opens Notification settings and the prefs API returns 200
- **THEN** the toggles reflect the server payload (not a conflicting SecureStore-only default)

#### Scenario: Offline / API failure fallback
- **WHEN** the prefs GET fails or is unavailable
- **THEN** the app uses the last cached prefs if present, otherwise defaults with `SYNC_COMPLETED` false, without crashing

### Requirement: Persist preference changes to server
When the user changes a push preference and the prefs API is available, the client SHALL `PUT /api/mobile/devices/preferences` with `{ preferences: … }` (Bearer `profile:write`) and MUST NOT report success if the PUT fails. Local cache SHALL update from the successful server response.

#### Scenario: Successful save
- **WHEN** the user toggles Daily Recommendation off and PUT succeeds
- **THEN** subsequent GET (or cache) shows `RECOMMENDATION_READY` false and the mutation completes successfully

#### Scenario: Save failure
- **WHEN** PUT fails
- **THEN** the UI shows an error and does not leave the toggle in a silently divergent “saved” state versus server

### Requirement: Sync-completed preference not user-enabled
The Notification settings UI MUST NOT present Sync Status as an active control that implies OS pushes for `SYNC_COMPLETED`. The client MUST NOT encourage enabling `SYNC_COMPLETED` (omit the row or keep it non-toggleable). Policy remains no OS push for sync completion.

#### Scenario: No sync push toggle
- **WHEN** the user opens Notification settings
- **THEN** there is no enabled Sync Status switch that can turn `SYNC_COMPLETED` on
