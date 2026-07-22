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
The authorization request SHALL include at least `profile:read`, `profile:write`, `workout:read`, `workout:write`, `health:read`, `health:write`, `nutrition:read`, `nutrition:write`, `goal:read`, `goal:write`, `plan:read`, `plan:write`, `recommendation:read`, `offline_access`, and chat scopes when available, matching the product baseline for the companion loop plus activation onboarding (goal lite + plan lite). Availability scopes (`availability:read` / `availability:write`) SHALL be included when plan lite persists availability through those endpoints.

#### Scenario: Offline access requested
- **WHEN** the user starts login
- **THEN** the authorize URL includes `offline_access` in the scope list

#### Scenario: Nutrition scopes requested
- **WHEN** the user starts login
- **THEN** the authorize URL includes `nutrition:read` and `nutrition:write` in the scope list

#### Scenario: Workout write scope requested
- **WHEN** the user starts login
- **THEN** the authorize URL includes `workout:write` in the scope list

#### Scenario: Goal write scope requested
- **WHEN** the user starts login or create-account
- **THEN** the authorize URL includes `goal:read` and `goal:write` in the scope list

#### Scenario: Plan write scope requested
- **WHEN** the user starts login or create-account and `plan:write` is allowlisted on the Official Mobile App
- **THEN** the authorize URL includes `plan:read` and `plan:write` in the scope list

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

### Requirement: Ad-hoc generate requires workout write scope
`POST /api/workouts/generate` used by the companion MUST authenticate via Bearer/`requireAuth` with `workout:write` (already included in the Official Mobile App / companion scope list). The mobile client MUST NOT call the endpoint when the access token lacks that scope.

#### Scenario: Bearer generate authorized
- **WHEN** the mobile client POSTs ad-hoc generate with a valid Bearer token that includes `workout:write`
- **THEN** the server authorizes the user without a browser session cookie

### Requirement: Sign-up and sign-in share PKCE
The unauthenticated auth screen SHALL offer create-account and sign-in entry points that both use the same OAuth Authorization Code + PKCE flow against the instance IdP. After tokens are obtained, activation onboarding SHALL determine whether the wizard or the tab shell is next.

#### Scenario: Create account entry
- **WHEN** the user chooses Create account
- **THEN** the app starts the PKCE authorize flow (same client and redirect as sign-in)

#### Scenario: Returning sign-in entry
- **WHEN** the user chooses Sign in
- **THEN** the app starts the PKCE authorize flow and, after success, applies the activation gate

### Requirement: IdP login supports Sign in with Apple during PKCE
When the official mobile client’s authorize request redirects an unauthenticated athlete to the Coach Watts IdP login page, that login page MUST offer Sign in with Apple in addition to existing third-party login options so Guideline 4.8 has an equivalent primary-account login. The mobile app’s PKCE client_id, redirect URI, code challenge, and scope request SHALL remain unchanged by this requirement.

#### Scenario: PKCE after Apple sign-in
- **WHEN** the athlete starts companion sign-in, completes Sign in with Apple on the IdP login page, and the authorize flow finishes
- **THEN** the app receives an authorization code at `coachwatts://oauth/callback` (or the configured redirect) and exchanges it with `code_verifier` for tokens as today

#### Scenario: Google PKCE still works
- **WHEN** the athlete starts companion sign-in and completes Sign in with Google on the IdP login page
- **THEN** the existing PKCE token exchange and authenticated shell entry still succeed

