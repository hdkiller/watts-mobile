# oauth-pkce Specification

## Purpose
TBD - created by archiving change phase-0-expo-oauth. Update Purpose after archive.
## Requirements
### Requirement: Authorization Code with PKCE
The system SHALL authenticate users using OAuth 2.0 Authorization Code flow with PKCE (S256) against the configured instance’s `/api/oauth/authorize` and `/api/oauth/token` endpoints, using the system browser / auth session APIs.

#### Scenario: Successful login
- **WHEN** the user completes authorization in the system browser and an authorization code is returned
- **THEN** the app exchanges the code with `code_verifier` for access and refresh tokens and enters the authenticated shell

### Requirement: Public client credentials
The mobile app SHALL identify itself with a configured `client_id` and MUST NOT embed a client secret in the application binary for production use.

#### Scenario: Token exchange without client secret
- **WHEN** the app exchanges an authorization code
- **THEN** the token request includes `client_id`, `code`, `redirect_uri`, and `code_verifier` and does not require a compiled-in client secret

### Requirement: Request least-privilege scopes including offline access
The authorization request SHALL include at least `profile:read`, `profile:write`, `workout:read`, `health:read`, `health:write`, `nutrition:read`, `nutrition:write`, `offline_access`, and recommendation/planning read scopes when available, matching the product baseline for Phase 1 readiness and v1.5 field writes (athlete metrics + nutrition quick-log).

#### Scenario: Offline access requested
- **WHEN** the user starts login
- **THEN** the authorize URL includes `offline_access` in the scope list

#### Scenario: Nutrition scopes requested
- **WHEN** the user starts login
- **THEN** the authorize URL includes `nutrition:read` and `nutrition:write` in the scope list

### Requirement: Secure token storage
The system SHALL store access and refresh tokens in the platform secure store and MUST NOT log token values.

#### Scenario: Tokens survive relaunch
- **WHEN** the user kills and relaunches the app after a successful login
- **THEN** the session is restored from secure storage without requiring immediate re-login (while refresh token remains valid)

### Requirement: Refresh on unauthorized responses
When an API call returns HTTP 401, the system SHALL attempt a single refresh-token grant, persist any rotated refresh token, retry the original request, and force re-authentication if refresh fails.

#### Scenario: Expired access token
- **WHEN** an authenticated request returns 401 and refresh succeeds
- **THEN** the original request is retried with the new access token

#### Scenario: Refresh failure
- **WHEN** refresh fails or is rejected
- **THEN** stored tokens are cleared and the user is returned to the sign-in flow

### Requirement: Sign out
The system SHALL provide a sign-out action that clears stored tokens and returns the user to the unauthenticated flow (instance URL may be retained).

#### Scenario: Sign out clears session
- **WHEN** the authenticated user signs out
- **THEN** tokens are removed from secure storage and the login screen is shown

