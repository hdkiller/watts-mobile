# api-client Delta — Login and Error Polish

## ADDED Requirements

### Requirement: Friendly error copy for user-facing failures
The system SHALL provide an error-mapping helper that classifies thrown errors by shape (API status, connectivity failure, timeout/abort) and returns human-readable copy; screens SHALL render this copy instead of raw `Error.message` strings. Raw errors SHALL still reach Sentry unmodified.

#### Scenario: Connectivity failure
- **WHEN** a query fails because the device is offline or the instance is unreachable
- **THEN** the screen shows copy such as "Can't reach your Coach Watts instance — check your connection" instead of the underlying fetch message

#### Scenario: Server error keeps status hint
- **WHEN** a request fails with an HTTP 5xx response
- **THEN** the screen shows friendly server-error copy that includes the status code, e.g. "Server error (502) — try again shortly"

#### Scenario: Session problem
- **WHEN** a request fails with 401 or 403 after refresh handling has run
- **THEN** the screen shows copy directing the user to sign in again rather than a raw authorization error

#### Scenario: Unknown errors fall back
- **WHEN** an error does not match a known class
- **THEN** the screen shows the caller-provided fallback copy for that surface (e.g. "Could not load today")
