## MODIFIED Requirements

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

## ADDED Requirements

### Requirement: Settings is the preferences home
More SHALL treat Settings as the home for push prefs, Health Sync, Units & locale, Coach identity, and Account export/delete Open web actions rather than scattering new preference editors as top-level More rows.

#### Scenario: New prefs live under Settings
- **WHEN** the user wants to change units or coach persona
- **THEN** those editors are reached from Settings, not as separate More top-level preference screens outside Settings
