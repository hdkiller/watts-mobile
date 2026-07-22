## ADDED Requirements

### Requirement: IdP offers Sign in with Apple
The Coach Watts IdP (coach-wattz) SHALL offer Sign in with Apple as a login method to establish or authenticate the user’s primary Coach Watts account, configured via Auth.js (or equivalent) with Apple Services ID credentials supplied by deployment secrets (not committed to git).

#### Scenario: Apple provider configured in production
- **WHEN** hosted Coach Watts is deployed with Apple Sign in secrets present
- **THEN** the Auth.js provider list includes Apple and the authorization callback URL registered with Apple accepts the Auth.js callback

### Requirement: OAuth login UI exposes SIWA with equal prominence
The `/oauth/login` page used by the official mobile OAuth client SHALL present a Sign in with Apple control with prominence comparable to Sign in with Google (not hidden behind secondary navigation).

#### Scenario: Mobile PKCE reaches SIWA
- **WHEN** an unauthenticated mobile athlete completes the authorize redirect to `/oauth/login`
- **THEN** the page shows Sign in with Apple alongside the other offered providers

#### Scenario: Athlete completes SIWA
- **WHEN** the athlete chooses Sign in with Apple and finishes Apple authentication successfully
- **THEN** the IdP session is established and the OAuth authorize flow can continue so the mobile app receives an authorization code via the existing PKCE redirect

### Requirement: Apple identity creates or links Coach Watts user
The IdP SHALL create a Coach Watts user for a new Apple identity, or link to an existing user when project account-linking rules allow a verified email match, and SHALL support Apple private relay emails as stable account emails for that Apple subject.

#### Scenario: First-time Apple sign-in
- **WHEN** an athlete signs in with Apple for the first time with no matching linked account
- **THEN** a new Coach Watts user is created and associated with the Apple provider account

#### Scenario: Returning Apple sign-in
- **WHEN** an athlete who previously used Sign in with Apple signs in again
- **THEN** they are authenticated as the same Coach Watts user without requiring email to be re-supplied every time

### Requirement: Web login surfaces include SIWA for parity
Web `/login` and `/join` (or equivalent primary account entry points that offer Google) SHALL also offer Sign in with Apple so hosted web and mobile IdP login remain consistent for Guideline 4.8.

#### Scenario: Web login shows Apple
- **WHEN** an unauthenticated user opens the hosted web login page that offers Google
- **THEN** Sign in with Apple is available as an equivalent option

### Requirement: App Review documentation covers SIWA and demo access
Distribution / App Review documentation SHALL describe that primary login uses OAuth in the system browser, that Sign in with Apple is available, and how reviewers use ASC Sign-In Information (dedicated demo Google and/or Apple credentials) without implying a Coach Watts-native password.

#### Scenario: Review notes are actionable
- **WHEN** engineers prepare ASC App Review Information for submission
- **THEN** in-repo distribution docs state the Safari → Sign in with Apple or Google → return via `coachwatts://oauth/callback` path and where demo credentials are stored (password manager + ASC, not git)
