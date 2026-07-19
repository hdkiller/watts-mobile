## ADDED Requirements

### Requirement: Account glue on More
The More tab SHALL show account glue: signed-in identity or instance URL, Open web, Notifications entry, and Sign out.

#### Scenario: More shows instance and actions
- **WHEN** the authenticated user opens More
- **THEN** they can see the configured instance, open Notifications, open web, and sign out

### Requirement: Notification prefs entry
The More tab SHALL provide an entry point for notification preferences (in-app toggles when available, otherwise OS settings and/or Open web).

#### Scenario: Prefs entry visible
- **WHEN** the user opens More
- **THEN** a notification preferences entry is available

### Requirement: Instance URL visible
The More (or settings) surface SHALL display the active instance base URL so self-hosted users can confirm where they are signed in.

#### Scenario: Self-hosted instance shown
- **WHEN** the user signed in against a non-default instance
- **THEN** that instance URL is visible on More
