## MODIFIED Requirements

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

## ADDED Requirements

### Requirement: Sign-up and sign-in share PKCE
The unauthenticated auth screen SHALL offer create-account and sign-in entry points that both use the same OAuth Authorization Code + PKCE flow against the instance IdP. After tokens are obtained, activation onboarding SHALL determine whether the wizard or the tab shell is next.

#### Scenario: Create account entry
- **WHEN** the user chooses Create account
- **THEN** the app starts the PKCE authorize flow (same client and redirect as sign-in)

#### Scenario: Returning sign-in entry
- **WHEN** the user chooses Sign in
- **THEN** the app starts the PKCE authorize flow and, after success, applies the activation gate
