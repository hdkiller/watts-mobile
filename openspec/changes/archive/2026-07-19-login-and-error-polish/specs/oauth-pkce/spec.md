# oauth-pkce Delta — Login and Error Polish

## ADDED Requirements

### Requirement: Production login screen hides developer registration details
The login screen SHALL only render OAuth developer plumbing — the computed redirect URI and CLI registration instructions — when running in a development runtime (`__DEV__` true or Expo Go detected). Production builds SHALL show only the brand wordmark, instance display with change action, and the sign-in control.

#### Scenario: Store build shows clean login
- **WHEN** the app runs as a production build
- **THEN** the login screen shows the Coach Watts wordmark, instance info, and sign-in button, and does not render the redirect URI or CLI instructions

#### Scenario: Dev runtime keeps registration help
- **WHEN** the app runs with `__DEV__` true or inside Expo Go
- **THEN** the redirect URI and registration guidance remain visible below the sign-in controls
