# app-web-session-handoff Specification

## Purpose
TBD - created by archiving change app-web-session-handoff. Update Purpose after archive.
## Requirements
### Requirement: Mint one-time web handoff from Bearer
The Coach Watts API SHALL accept an authenticated request (`Authorization: Bearer` via existing `requireAuth`) to mint a short-lived, single-use app→web handoff code bound to the authenticated user, and SHALL return an absolute consume URL (and expiry) suitable for opening in a browser. The response MUST NOT include the access token or refresh token.

#### Scenario: Successful mint
- **WHEN** a signed-in companion client calls the handoff mint endpoint with a valid Bearer token and optional same-origin relative `returnTo`
- **THEN** the API responds with an absolute consume URL containing an opaque code and an `expiresIn` of at most 60 seconds

#### Scenario: Invalid returnTo rejected
- **WHEN** the client supplies a `returnTo` that is absolute, scheme-bearing, protocol-relative (`//…`), or contains `..` path segments
- **THEN** the API rejects the request with 400 and does not mint a code

#### Scenario: Unauthenticated mint rejected
- **WHEN** the mint endpoint is called without a valid session, API key, or Bearer token
- **THEN** the API responds 401 and does not mint a code

### Requirement: Consume handoff creates web session
Opening the consume URL in a browser SHALL validate the code, invalidate it, create a standard Auth.js web `Session` for that user, set the Auth.js session cookie (`next-auth.session-token` or `__Secure-next-auth.session-token` on HTTPS), and redirect to the allowed `returnTo` (default `/`). Reuse of the same code MUST fail.

#### Scenario: First consume signs the browser in
- **WHEN** the athlete opens a fresh, unexpired handoff consume URL
- **THEN** subsequent navigations to authenticated web pages on that origin treat them as signed in as the handoff user without an interactive login

#### Scenario: Replay fails
- **WHEN** the same consume URL is opened again after a successful consume (or after expiry)
- **THEN** no new session is created from that code and the browser is redirected to a login (or error) path where they can sign in normally

### Requirement: Mobile Open web uses handoff for instance URLs
The companion SHALL mint a handoff and open the returned consume URL whenever the user chooses an Open web action that targets the configured instance (home or in-app path). If mint fails (network, 404 on older instances, 5xx), the app SHALL fall back to opening the bare instance URL/path so the escape hatch still works.

#### Scenario: Open web with handoff
- **WHEN** the authenticated user taps Open web for an instance destination
- **THEN** the app obtains a handoff URL and opens it in the system / in-app browser

#### Scenario: Handoff unavailable
- **WHEN** handoff mint fails
- **THEN** the app opens the bare instance destination URL without blocking the user

### Requirement: External non-instance links stay direct
Legal, support, and other non-instance URLs SHALL continue to open without app→web handoff.

#### Scenario: Privacy policy
- **WHEN** the user opens Privacy policy (or Terms / Support) from More
- **THEN** the app opens that URL directly without calling the handoff mint endpoint

