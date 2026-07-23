# account-more Specification

## Purpose
TBD - created by archiving change phase-3-store-polish. Update Purpose after archive.
## Requirements
### Requirement: Account glue on More
The More tab SHALL show account glue: signed-in identity or instance URL, Settings entry, Open web, Notifications inbox entry, and Sign out. Instance URL MAY be shown on More and/or under Settings; Settings MUST remain the primary home for preference screens.

#### Scenario: More shows instance and actions
- **WHEN** the authenticated user opens More
- **THEN** they can see identity or instance context, open Settings, open Notifications inbox, open web, and sign out

### Requirement: Notification prefs entry
The More tab SHALL provide an entry point for notification preferences via Settings (Settings → Notifications). A direct More shortcut is optional; OS settings and/or Open web remain fallbacks when in-app toggles are unavailable.

#### Scenario: Prefs entry visible
- **WHEN** the user opens More
- **THEN** a path to notification preferences is available (Settings and/or a direct prefs row)

### Requirement: Instance URL visible
The More or Settings surface SHALL display the active instance base URL so self-hosted users can confirm where they are signed in.

#### Scenario: Self-hosted instance shown
- **WHEN** the user signed in against a non-default instance
- **THEN** that instance URL is visible on More and/or Settings → Instance

### Requirement: Settings is the preferences home
More SHALL treat Settings as the home for push prefs, Health Sync, Units & locale, Coach identity, and Account export/delete Open web actions rather than scattering new preference editors as top-level More rows.

#### Scenario: New prefs live under Settings
- **WHEN** the user wants to change units or coach persona
- **THEN** those editors are reached from Settings, not as separate More top-level preference screens outside Settings

### Requirement: Athlete profile entry labeling
The More tab SHALL provide an entry to the Athlete destination whose label or subtitle indicates profile / AI overview access (not metrics-only), while still reaching the same Athlete screen that includes metric editing.

#### Scenario: More entry wording
- **WHEN** the authenticated user opens More
- **THEN** an Athlete (or Athlete profile) row is available that navigates to `/(app)/athlete`

#### Scenario: Not metrics-only implication
- **WHEN** the Athlete profile overview is implemented
- **THEN** More does not label the entry in a way that implies only a metrics form with no profile summary

### Requirement: Discoverability of sport settings
The More / Athlete / Settings entry points SHALL NOT imply that Athlete metrics is the only place to manage training thresholds when Settings → Sports exists; labeling or helper copy MAY mention sport profiles under Settings.

#### Scenario: Athlete metrics label stays honest
- **WHEN** the user views More
- **THEN** the Athlete entry remains available for default metrics and does not claim to replace full sport-profile management

### Requirement: Open web uses session handoff helper
The More tab Open web action SHALL use the shared instance Open web helper that mints an app→web handoff before opening the browser, with bare-URL fallback on mint failure. External About links (privacy, terms, support) MUST NOT use handoff.

#### Scenario: More Open web hands off
- **WHEN** the authenticated user chooses Open web on More
- **THEN** the app opens a handoff consume URL for the instance home (or bare instance URL if mint fails)

#### Scenario: About links skip handoff
- **WHEN** the user opens Privacy policy, Terms, or Support from More
- **THEN** those URLs open directly without a handoff mint

