# push-registration Specification

## Purpose
TBD - created by archiving change phase-2-notifications-push. Update Purpose after archive.
## Requirements
### Requirement: Request notification permission after auth
After the user reaches the authenticated shell, the system SHALL request OS notification permission at an appropriate moment (not during the OAuth browser flow).

#### Scenario: Permission prompt post-login
- **WHEN** an authenticated session becomes ready and permission is undetermined
- **THEN** the app may present the system notification permission prompt without interrupting PKCE

### Requirement: Obtain Expo push token
When notification permission is granted, the system SHALL obtain an Expo push token for the running app installation.

#### Scenario: Token acquired
- **WHEN** permission is granted and Expo push configuration is available
- **THEN** the client obtains a push token string for registration

### Requirement: Register device with instance
The system SHALL register the Expo push token with the configured instance via `POST /api/mobile/devices` (or the documented equivalent) including platform, using the Bearer API client.

#### Scenario: Successful registration
- **WHEN** a push token is available and the device endpoint accepts the request
- **THEN** the token is associated with the signed-in user on that instance

#### Scenario: Endpoint unavailable
- **WHEN** device registration returns 404 or is not yet deployed
- **THEN** the app MUST NOT crash; inbox remains usable and registration can retry later

### Requirement: Clear registration on sign-out when supported
On sign-out, the system SHALL attempt to unregister or stop using the device token when a server delete/unregister API exists; otherwise it SHALL stop sending the prior user’s token on subsequent authenticated requests until re-registered.

#### Scenario: Sign out stops prior user pushes locally
- **WHEN** the user signs out
- **THEN** the client clears locally cached registration state for that session

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

