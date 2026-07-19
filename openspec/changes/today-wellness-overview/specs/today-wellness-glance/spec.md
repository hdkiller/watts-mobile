## REMOVED Requirements

### Requirement: Inline expandable seven-day trend bars
**Reason**: 7-day trends move into the Wellness Overview sheet (`wellness-overview`) so Today stays a compact tile row without a second trend UI.
**Migration**: Implement tap-to-open Wellness Overview; do not ship inline expand/collapse bars on the glance.

## ADDED Requirements

### Requirement: Glance opens Wellness Overview
Tapping the Recent Wellness glance metric row (tiles) SHALL open the Wellness Overview sheet for the latest wellness day. The distinct Check in control MUST NOT open the overview and MUST continue to navigate to the Log tab wellness surface.

#### Scenario: Tap tiles open overview
- **WHEN** the athlete taps the Recent Wellness metric tiles or glance body (excluding Check in)
- **THEN** the Wellness Overview sheet opens

#### Scenario: Check in unchanged
- **WHEN** the athlete taps Check in on the glance
- **THEN** the app navigates to the Log tab wellness section and does not open Wellness Overview
