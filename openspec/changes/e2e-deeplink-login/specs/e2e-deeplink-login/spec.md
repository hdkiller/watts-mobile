## ADDED Requirements

### Requirement: E2E deep-link fixture login
The companion SHALL support a scheme deep link `coachwatts://e2e/login` that, for allowlisted instance hosts only, mints a fixture Bearer via `POST {instance}/api/__e2e/token` and seeds SecureStore so bootstrap can reach the authenticated shell without system-browser PKCE.

#### Scenario: Successful login with defaults
- **WHEN** the app receives `coachwatts://e2e/login` (optional `email` / `instance` query params omitted)
- **THEN** the app uses email `e2e-athlete@coachwatts.test` and instance `http://127.0.0.1:3199`, mints tokens, persists instance + tokens, and proceeds as an authenticated athlete

#### Scenario: Explicit email and instance
- **WHEN** the app receives `coachwatts://e2e/login?email=e2e-athlete@coachwatts.test&instance=http://127.0.0.1:3199`
- **THEN** the app mints tokens against that instance for that email and seeds SecureStore accordingly

#### Scenario: Non-allowlisted host refused
- **WHEN** the `instance` query host is not localhost / `127.0.0.1` / `10.0.2.2` and not listed in `EXPO_PUBLIC_E2E_ALLOWED_HOSTS` (and `EXPO_PUBLIC_E2E_ALLOW_ANY_HOST` is not enabled)
- **THEN** the app MUST NOT mint or persist tokens and MUST leave the athlete signed out

#### Scenario: Token endpoint failure
- **WHEN** `POST /api/__e2e/token` fails or returns no access token
- **THEN** the app MUST NOT mark the session authenticated and MUST surface a recoverable error on the login path

### Requirement: Maestro uses deep-link login for authenticated flows
Authenticated Maestro journeys SHALL obtain a fixture session via the e2e login deep link after Metro connect, without requiring `EXPO_PUBLIC_E2E_AUTH` to be enabled in the Metro process.

#### Scenario: Auth shell smoke
- **WHEN** `smoke-shell` (or another authenticated flow) runs with Metro healthy and the e2e API on `:3199`
- **THEN** the flow connects the packager, opens `coachwatts://e2e/login…`, and eventually asserts `today-screen` (given a soft-activated e2e athlete)

#### Scenario: Unauth smoke unchanged
- **WHEN** `smoke-unauth` runs
- **THEN** the flow MUST NOT open the e2e login deep link and MUST assert `login-screen`
