# today-home Specification

## Purpose
TBD - created by archiving change phase-1-today-loop. Update Purpose after archive.
## Requirements
### Requirement: Today decision surface
The Today tab SHALL present a single scrollable morning surface with: greeting/date, recommendation hero (action + short rationale), planned workout summary when available, optional compact recovery strip, and primary CTAs.

#### Scenario: Recommendation present
- **WHEN** today’s recommendation is loaded successfully
- **THEN** the hero shows the recommended action and a one-to-two line reason above the primary CTAs

#### Scenario: First viewport focus
- **WHEN** the Today tab renders with data
- **THEN** the primary decision CTAs are visible without navigating to another tab

### Requirement: Empty and loading states
The Today tab SHALL show a skeleton/loading state while fetching and a clear empty state when no recommendation exists for today.

#### Scenario: No recommendation
- **WHEN** the today recommendation API returns null/empty
- **THEN** the user sees an honest empty message (not a blank screen) and a way to open the web app or retry

### Requirement: Planned workout entry point
When a planned workout is associated with today, the Today tab SHALL let the user open a detail screen with title, duration, intensity/TSS, and interval summary when available.

#### Scenario: Open planned workout detail
- **WHEN** the user taps the planned workout block
- **THEN** the app navigates to a detail stack screen for that workout

### Requirement: Active recovery context on Today
The Today tab SHALL show compact read-oriented chips for recovery-context items active today (when any exist), placed with the recovery strip and below the recommendation/planned blocks.

#### Scenario: Active chips visible
- **WHEN** one or more recovery-context items are active for the local today
- **THEN** Today shows compact chips for those items that open the item detail/edit flow when tapped

### Requirement: Quiet Log recovery event affordance on Today
The Today tab SHALL offer a secondary text affordance (“Log recovery event” or equivalent) that opens the recovery-event create flow. It MUST NOT use a primary button style and MUST appear below the primary recommendation CTAs when those CTAs are shown.

#### Scenario: Open recovery event from Today
- **WHEN** the user taps Log recovery event on Today
- **THEN** the app navigates to the recovery-event create flow

#### Scenario: Primary CTAs remain primary
- **WHEN** Today renders with a recommendation
- **THEN** Accept (and later Modify / Rest) remain the primary decision actions above the Log recovery event control

