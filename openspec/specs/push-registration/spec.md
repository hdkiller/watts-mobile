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

