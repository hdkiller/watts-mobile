# activation-onboarding Specification

## Purpose
TBD - created by archiving change mobile-activation-onboarding. Update Purpose after archive.
## Requirements
### Requirement: Server-driven activation status
The app SHALL load activation state from the Coach Watts onboarding/activation API (extended `GET /api/user/onboarding-status` or documented successor) after authentication and MUST NOT treat a local-only checklist as source of truth for soft vs full activation.

#### Scenario: Status loads after sign-in
- **WHEN** the user completes OAuth and tokens are stored
- **THEN** the app fetches activation status with the Bearer token before presenting the normal tab shell as fully ready

#### Scenario: Soft vs full flags
- **WHEN** the status payload indicates soft-activated but not fully activated
- **THEN** the app treats the athlete as allowed into companion tabs with Finish-setup affordances until usable data exists

### Requirement: Activation wizard route gate
When the athlete is authenticated but not soft-activated (missing consent, primary goal, activated plan, or first insight per server flags), the app SHALL route them into the activation wizard stack and MUST NOT present the four-tab shell as the primary experience.

#### Scenario: Incomplete soft activation
- **WHEN** soft activation is incomplete
- **THEN** navigation enters the activation wizard at the current server step

#### Scenario: Resume after kill
- **WHEN** the user force-quits mid-wizard and relaunches with a valid session
- **THEN** the app resumes the wizard at the server-derived current step

#### Scenario: Soft-activated enters tabs
- **WHEN** soft activation is complete
- **THEN** the user can access Today, Log, Coach, and More

### Requirement: Consent step
The activation wizard SHALL include a native consent step that collects terms, privacy, and health/biometric consent and submits via Bearer `POST /api/user/consent` with current policy versions before goal/plan steps proceed.

#### Scenario: Consent required
- **WHEN** the server indicates consent is incomplete
- **THEN** the wizard blocks on the consent step until submission succeeds

#### Scenario: Consent succeeds
- **WHEN** the user accepts required consents and submit succeeds
- **THEN** the wizard advances to the goal step (or the next incomplete server step)

### Requirement: Wizard step order
The activation wizard UX SHALL present steps in this order when incomplete: consent → goal lite → plan lite → first insight → connect data. Connect MUST be last among these steps and MUST offer Skip / Later.

#### Scenario: Connect is last
- **WHEN** the athlete reaches the connect step
- **THEN** goal, plan, and first insight soft requirements are already satisfied (or the server marks those steps complete)

#### Scenario: Skip connect
- **WHEN** the user chooses Skip / Later on connect
- **THEN** the app enters the soft-activated companion experience without requiring a connected app or Health Sync

### Requirement: Connect-last composition
The connect step SHALL offer Health Sync as the primary path, Connected Apps lite as a secondary path, and Skip / Later. It MUST NOT implement native provider OAuth.

#### Scenario: Health Sync primary
- **WHEN** the user chooses the primary connect action
- **THEN** the app opens the existing Health Sync settings flow

#### Scenario: Connected Apps secondary
- **WHEN** the user chooses to connect a wearable service
- **THEN** the app opens Connected Apps lite (or its handoff actions)

### Requirement: First insight reveal
After plan activation, the wizard SHALL present a first-insight surface that shows the athlete’s upcoming plan week (or equivalent planned workouts) and MAY offer Analyze Readiness with honest copy when biometrics are thin. Completing or dismissing this step MUST update server insight/activation progress when an API exists for that mark.

#### Scenario: Week reveal
- **WHEN** a plan has been activated and insight is not yet marked
- **THEN** the wizard shows a readable first-week (or near-term planned) summary before connect

#### Scenario: Thin biometrics honesty
- **WHEN** Analyze Readiness is offered before usable wellness/activity data exists
- **THEN** copy indicates coaching quality improves after connecting data

### Requirement: Finish-setup on Today
When the athlete is soft-activated but not fully activated, Today SHALL show a single Finish-setup (or resume connect) surface and MUST NOT present a stacked column of independent empty-section cards as the primary first-run experience.

#### Scenario: Soft-activated empty Today
- **WHEN** soft activation is complete, usable data is missing, and Today would otherwise show multiple empty glances
- **THEN** Today prioritizes Finish-setup / connect guidance over a pile of “No X yet” cards

#### Scenario: Fully activated dismisses setup
- **WHEN** the athlete becomes fully activated
- **THEN** the Finish-setup surface is no longer shown as an incomplete-activation gate

### Requirement: Activation analytics without health values
The app SHALL emit minimal activation funnel events (consent, goal, plan, insight, connect/skip, soft-activated, fully-activated) and MUST NOT include health metric values in those events.

#### Scenario: Soft activated event
- **WHEN** soft activation becomes complete
- **THEN** a product analytics event is recorded without wellness/workout metric payloads

### Requirement: Older instance degradation
If activation APIs are missing or reject Bearer auth on an older self-hosted instance, the app SHALL show an honest error and offer Open web / handoff rather than inventing a completed local activation state.

#### Scenario: Plan initialize unavailable
- **WHEN** plan lite initialize returns 401/404/not-supported
- **THEN** the user sees a clear message and an Open web escape without marking plan complete locally

