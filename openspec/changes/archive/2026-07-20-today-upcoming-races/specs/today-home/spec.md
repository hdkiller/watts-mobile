## ADDED Requirements

### Requirement: Upcoming Events glance on Today
The Today tab SHALL show an Upcoming Events glance when at least one upcoming race/life event exists, reusing the upcoming-events list contract (`GET /api/events` with Bearer `goal:read`). The glance SHALL be capped to roughly the next 3 events, with rows showing a month/day date block, title, type/location meta when available, and a days-until countdown. “See all” SHALL navigate to the Upcoming Events list. Tapping a row SHALL open lite in-app event detail. The glance MUST appear below primary CTAs (with other context glances) and MUST NOT be a calendar. When there are zero upcoming events, the section SHALL be omitted (no dense empty chrome).

#### Scenario: Upcoming events present
- **WHEN** one or more upcoming events are available
- **THEN** Today shows the Upcoming Events section with up to three rows and a See all control

#### Scenario: No upcoming events
- **WHEN** the events query returns no upcoming events
- **THEN** Today omits the Upcoming Events section without blocking the decision hero

#### Scenario: Open event from glance
- **WHEN** the user taps an Upcoming Events row
- **THEN** the app opens that event’s lite detail screen

#### Scenario: See all events
- **WHEN** the user taps See all on Upcoming Events
- **THEN** the app navigates to the Upcoming Events list screen

### Requirement: Single race surface on Today
Today MUST NOT show a separate event-countdown chip or a Coming up “Next event” footer line once the Upcoming Events glance is available. Race/life countdown context SHALL live on Upcoming Events rows (and event detail) only.

#### Scenario: No duplicate countdown chip
- **WHEN** Today renders with upcoming events
- **THEN** the former standalone event countdown chip is not shown

#### Scenario: Coming up stays planned-only
- **WHEN** Coming up renders on Today
- **THEN** it continues to list planned workouts only and MUST NOT append a next-event text line

## MODIFIED Requirements

### Requirement: Today decision surface
The Today tab SHALL present a single scrollable morning surface with: greeting/date, recommendation hero (action + short rationale) or planned-only hero when no recommendation but today’s planned workout exists, planned workout summary when available alongside a recommendation, a read-only Recent Wellness glance per `today-wellness-glance` when wellness data or an empty-state affordance applies, a named Active Recovery Context band, primary CTAs, then context glances including Upcoming Events (when events exist), Coming up (planned), and Recently. The first viewport MUST remain one decision composition — glances MUST appear below primary CTAs (or below the recovery band when no CTAs are shown) and MUST NOT introduce calendar heatmaps, CTL grids, or dashboard stat strips. The system MUST NOT present recommendation-`analysisJson` Sleep/HRV labels as if they were device wellness biometrics once the Recent Wellness glance is available.

#### Scenario: Recommendation present
- **WHEN** today’s recommendation is loaded successfully
- **THEN** the hero shows the recommended action and a one-to-two line reason above the primary CTAs

#### Scenario: First viewport focus
- **WHEN** the Today tab renders with data
- **THEN** the primary decision CTAs (or planned-only hero actions) are visible without navigating to another tab

#### Scenario: Glances below decision
- **WHEN** Today renders Upcoming Events, Coming up, or Recently teasers
- **THEN** those sections appear below the primary decision CTAs when CTAs are present

#### Scenario: Recent Wellness context
- **WHEN** recent wellness metrics are available
- **THEN** Today shows the Recent Wellness glance as compact context near Active Recovery Context, not as a dashboard header above the hero

#### Scenario: No AI biometric strip
- **WHEN** the Recent Wellness glance is implemented
- **THEN** Today does not show a separate Sleep/HRV tile strip derived only from recommendation analysis JSON
