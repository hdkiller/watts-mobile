# api-client Specification

## Purpose
TBD - created by archiving change phase-0-expo-oauth. Update Purpose after archive.
## Requirements
### Requirement: Authenticated HTTP client
The system SHALL provide an HTTP client that prefixes requests with the configured instance API base (`{instance}/api`) and attaches `Authorization: Bearer {access_token}` when a session exists.

#### Scenario: Bearer header attached
- **WHEN** an authenticated feature calls the API client
- **THEN** the outgoing request includes the Bearer access token

### Requirement: TanStack Query provider
The system SHALL mount a TanStack Query `QueryClientProvider` at the application root so feature screens can use queries and mutations.

#### Scenario: Query hooks available
- **WHEN** an authenticated screen uses a TanStack Query hook
- **THEN** the hook runs under the shared QueryClient without additional provider setup

### Requirement: Userinfo smoke check after login
After a successful token exchange, the system SHALL fetch `/api/oauth/userinfo` (or equivalent profile endpoint) to verify the session and MAY display the user’s name or email on the More screen.

#### Scenario: Profile loads after login
- **WHEN** login completes successfully
- **THEN** the app can display basic profile identity from the userinfo response

