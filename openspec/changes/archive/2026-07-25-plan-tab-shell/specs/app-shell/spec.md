## REMOVED Requirements

### Requirement: Four-tab authenticated navigation
**Reason**: Product repositioned to five-tab IA with standing Plan tab (2026-07-24).
**Migration**: Use Requirement: Five-tab authenticated navigation.

## ADDED Requirements

### Requirement: Five-tab authenticated navigation
When the user is authenticated **and soft-activated** (per activation-onboarding status), the system SHALL present bottom tabs labeled Today, Plan, Log, Coach, and More, where Plan is the standing training/nutrition plan surface and More hosts account/settings destinations (notifications, instance, open web, sign out) rather than remaining a permanent placeholder. When the user is authenticated but soft activation is incomplete, the system SHALL present the activation wizard instead of the five-tab shell as the primary navigation.

#### Scenario: Soft-activated user sees tabs
- **WHEN** a valid session exists and soft activation is complete
- **THEN** the user can navigate among Today, Plan, Log, Coach, and More tabs

#### Scenario: Incomplete activation sees wizard
- **WHEN** a valid session exists and soft activation is incomplete
- **THEN** the app presents the activation wizard stack rather than the five tabs as the home experience

#### Scenario: More is account hub
- **WHEN** the soft-activated authenticated user opens More
- **THEN** they can reach account glue actions required for the store candidate
