# today-home Specification

## Purpose
TBD - created by archiving change phase-1-today-loop. Update Purpose after archive.
## Requirements
### Requirement: Today decision surface
The Today tab SHALL present a single scrollable morning surface with: greeting/date, recommendation hero (action + short rationale) or planned-only hero when no recommendation but today’s planned workout exists, planned workout summary when available alongside a recommendation, optional compact recovery metrics, a named Active Recovery Context band, primary CTAs, then thin Coming up and Recently glances. The first viewport MUST remain one decision composition — glances MUST appear below primary CTAs (or below the recovery band when no CTAs are shown) and MUST NOT introduce calendar heatmaps, CTL grids, or dashboard stat strips.

#### Scenario: Recommendation present
- **WHEN** today’s recommendation is loaded successfully
- **THEN** the hero shows the recommended action and a one-to-two line reason above the primary CTAs

#### Scenario: First viewport focus
- **WHEN** the Today tab renders with data
- **THEN** the primary decision CTAs (or planned-only hero actions) are visible without navigating to another tab

#### Scenario: Glances below decision
- **WHEN** Today renders Coming up or Recently teasers
- **THEN** those sections appear below the primary decision CTAs when CTAs are present

### Requirement: Empty and loading states
The Today tab SHALL show a loading state while fetching and a clear empty state when no recommendation exists for today and no planned workout is available. When no recommendation exists but today’s planned workout is available, the planned workout SHALL be the hero decision surface. Empty/no-recommendation states MAY offer Open web (instance) and Retry; they MUST NOT present a fake on-device “generate recommendation” or Analyze Readiness action unless a real Bearer generate API is already wired.

#### Scenario: No recommendation
- **WHEN** the today recommendation API returns null/empty and there is no planned workout for today
- **THEN** the user sees an honest empty message (not a blank screen) and a way to open the web app or retry

#### Scenario: Planned-only hero
- **WHEN** there is no recommendation but today’s planned workout is available
- **THEN** Today presents that planned workout as the primary decision surface (not only a secondary empty card)

### Requirement: Planned workout entry point
When a planned workout is associated with today, the Today tab SHALL let the user open a detail screen with title, duration, intensity/TSS, and interval summary when available.

#### Scenario: Open planned workout detail
- **WHEN** the user taps the planned workout block
- **THEN** the app navigates to a detail stack screen for that workout

### Requirement: Active recovery context on Today
The Today tab SHALL show a named **Active Recovery Context** band with a clear header and short helper that Coach Watts uses this context when generating today’s guidance. The band SHALL include compact chips for recovery-context items active today when any exist, an honest empty state when none exist, and secondary actions: Log event (recovery-event create), Check in (Log tab wellness, without duplicating the wellness form on Today), and a quiet History affordance (Log recovery section and/or existing web escape patterns).

#### Scenario: Active chips visible
- **WHEN** one or more recovery-context items are active for the local today
- **THEN** Today shows the named band with compact chips for those items that open the item detail/edit flow when tapped

#### Scenario: Empty recovery context
- **WHEN** no recovery-context items are active for today
- **THEN** the named band still renders with an empty-state message and secondary Log event / Check in actions

#### Scenario: Check in from Today
- **WHEN** the user taps Check in on the Active Recovery Context band
- **THEN** the app navigates to the Log tab (wellness section when supported) and MUST NOT render a second wellness form on Today

#### Scenario: Primary CTAs remain primary
- **WHEN** Today renders with a recommendation
- **THEN** Accept (and later Modify / Rest) remain the primary decision actions above Coming up / Recently glances; Active Recovery Context actions stay secondary

### Requirement: Coming up planned teaser on Today
The Today tab SHALL show a thin Coming up strip of upcoming **planned workouts** only (not race/life calendar events), reusing the existing upcoming-planned query contract, capped to roughly the next 2–3 sessions (or next ~3–7 days). “See all” SHALL navigate to `/(app)/upcoming`. The strip MUST NOT be a full calendar.

#### Scenario: Upcoming sessions present
- **WHEN** upcoming planned workouts are available
- **THEN** Today shows a short teaser list with title/date (and type or duration when available) and a See all control that opens Upcoming

#### Scenario: No upcoming sessions
- **WHEN** the upcoming planned query returns an empty list
- **THEN** Today shows a quiet empty line or omits dense empty chrome without blocking the decision hero

#### Scenario: Planned workouts only
- **WHEN** Coming up renders on Today
- **THEN** rows are planned workouts from the planned-workouts API and MUST NOT include separate calendar/life events

### Requirement: Recently activity teaser on Today
The Today tab SHALL show a thin Recently teaser of 1–2 recent activities reusing the existing recent-activity query, with “See all” navigating to `/(app)/activity`.

#### Scenario: Recent activities present
- **WHEN** recent activities are available
- **THEN** Today shows one or two rows and a See all control that opens Recent activity

#### Scenario: No recent activities
- **WHEN** the recent activity query returns an empty list
- **THEN** Today shows a quiet empty line or omits dense empty chrome without blocking the decision hero

