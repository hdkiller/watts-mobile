## ADDED Requirements

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
