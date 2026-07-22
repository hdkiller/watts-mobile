## ADDED Requirements

### Requirement: IdP login supports Sign in with Apple during PKCE
When the official mobile client’s authorize request redirects an unauthenticated athlete to the Coach Watts IdP login page, that login page MUST offer Sign in with Apple in addition to existing third-party login options so Guideline 4.8 has an equivalent primary-account login. The mobile app’s PKCE client_id, redirect URI, code challenge, and scope request SHALL remain unchanged by this requirement.

#### Scenario: PKCE after Apple sign-in
- **WHEN** the athlete starts companion sign-in, completes Sign in with Apple on the IdP login page, and the authorize flow finishes
- **THEN** the app receives an authorization code at `coachwatts://oauth/callback` (or the configured redirect) and exchanges it with `code_verifier` for tokens as today

#### Scenario: Google PKCE still works
- **WHEN** the athlete starts companion sign-in and completes Sign in with Google on the IdP login page
- **THEN** the existing PKCE token exchange and authenticated shell entry still succeed
