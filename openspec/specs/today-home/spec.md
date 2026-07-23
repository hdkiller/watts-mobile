# today-home Specification

## Purpose
TBD - created by archiving change phase-1-today-loop. Update Purpose after archive.
## Requirements
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

### Requirement: Empty and loading states
The Today tab SHALL show a loading state while fetching and a clear empty state when no recommendation exists for today and no planned workout is available. When no recommendation exists but today’s planned workout is available, the planned workout SHALL be the hero decision surface. Empty/no-recommendation states MAY offer Open web (instance) and Retry. When the Bearer Analyze Readiness generate API is available, the empty (no recommendation, no planned-only hero) state SHALL offer Analyze Readiness; the app MUST NOT present a fake generate action when that API is unavailable. When the athlete is soft-activated but not fully activated, Today SHALL prioritize a Finish-setup / connect surface per `activation-onboarding` over a stacked column of independent empty glance cards.

#### Scenario: No recommendation
- **WHEN** the today recommendation API returns null/empty and there is no planned workout for today and the athlete is fully activated (or activation gating does not apply)
- **THEN** the user sees an honest empty message (not a blank screen) and a way to open the web app or retry

#### Scenario: Planned-only hero
- **WHEN** there is no recommendation but today’s planned workout is available
- **THEN** Today presents that planned workout as the primary decision surface (not only a secondary empty card)

#### Scenario: Analyze Readiness available
- **WHEN** there is no recommendation and no planned-only hero and generate is Bearer-available and Finish-setup is not the required incomplete-activation surface
- **THEN** Today shows Analyze Readiness as a primary empty-state action

#### Scenario: Analyze Readiness unavailable
- **WHEN** generate is not Bearer-available
- **THEN** Today does not show a decorative Analyze Readiness button

#### Scenario: Soft-activated prefers Finish-setup
- **WHEN** the athlete is soft-activated but not fully activated and Today would otherwise show multiple empty sections
- **THEN** Today shows Finish-setup / connect guidance as the primary incomplete-activation surface instead of a pile of empty cards

### Requirement: Planned workout entry point
When a planned workout is associated with today, the Today tab SHALL let the user open a detail screen with title, duration, intensity/TSS, and interval summary when available.

#### Scenario: Open planned workout detail
- **WHEN** the user taps the planned workout block
- **THEN** the app navigates to a detail stack screen for that workout

### Requirement: Active recovery context on Today
The Today tab SHALL show a named **Active Recovery Context** band with a clear header and short helper that Coach Watts uses this context when generating today’s guidance. The band SHALL include compact chips for recovery-context items active today when any exist, an honest empty state when none exist, and secondary actions: Log event (recovery-event create), wellness Check in (Log tab wellness form, without duplicating the wellness form on Today), and a quiet History affordance (Log recovery section and/or existing web escape patterns). Wellness Check in MUST remain distinct from Daily Coach Check-In (AI questionnaire).

#### Scenario: Active chips visible
- **WHEN** one or more recovery-context items are active for the local today
- **THEN** Today shows the named band with compact chips for those items that open the item detail/edit flow when tapped

#### Scenario: Empty recovery context
- **WHEN** no recovery-context items are active for today
- **THEN** the named band still renders with an empty-state message and secondary Log event / wellness Check in actions

#### Scenario: Wellness check in from Today
- **WHEN** the user taps wellness Check in on the Active Recovery Context band
- **THEN** the app navigates to the Log tab (wellness section when supported) and MUST NOT render a second wellness form on Today and MUST NOT open the AI Daily Coach Check-In questionnaire

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

### Requirement: Wellness overview does not block decision
Loading or failure of the Wellness Overview detail query MUST NOT block rendering of the recommendation hero, planned workout, or primary CTAs. The overview sheet SHALL show its own loading and error states after open.

#### Scenario: Overview fetch fails
- **WHEN** the athlete opens Wellness Overview and the wellness detail request errors
- **THEN** the sheet shows an honest error/retry state and Today behind the sheet remains usable after dismiss

### Requirement: Training load glance does not block decision
Loading or failure of the PMC query MUST NOT block rendering of the recommendation hero, planned workout, or primary CTAs.

#### Scenario: PMC slow or failing
- **WHEN** the performance PMC query is loading or errors
- **THEN** the recommendation/planned decision surface still renders and the Training Load glance is omitted or shows a short unavailable state

### Requirement: Wellness glance does not block decision
Loading or failure of wellness/profile trend queries MUST NOT block rendering of the recommendation hero, planned workout, or primary CTAs. The Recent Wellness glance SHALL omit or show a quiet unavailable state on wellness fetch failure.

#### Scenario: Wellness slow or failing
- **WHEN** the wellness or profile dashboard query is loading or errors
- **THEN** the recommendation/planned decision surface still renders and the glance is omitted or shows a short unavailable state

### Requirement: Daily Coach Check-In entry on Today
The Today tab SHALL offer Daily Coach Check-In when today’s AI questionnaire is incomplete, as a distinct action from Accept / Rest / Analyze Readiness and from Active Recovery Context wellness navigation. When the Bearer check-in APIs are unavailable, Today MUST NOT show a fake Daily Coach Check-In CTA.

#### Scenario: Incomplete shows coach check-in
- **WHEN** today’s AI Daily Coach Check-In is incomplete and Bearer check-in APIs are available
- **THEN** Today shows Daily Coach Check-In as a clear action

#### Scenario: Unavailable API
- **WHEN** generate or answer check-in endpoints are not Bearer-capable for the client
- **THEN** Today does not show a decorative Daily Coach Check-In button that cannot complete

### Requirement: Monthly Progress glance does not block decision
The Today tab MAY show a Monthly Progress glance below primary recommendation / Accept CTAs (alongside Training Load and week glances). Monthly Progress MUST NOT push primary CTAs out of the first-viewport decision composition when a recommendation exists, and MUST NOT introduce a first-viewport dashboard chart.

#### Scenario: Placement
- **WHEN** Monthly Progress data is available
- **THEN** it appears as a thin context glance after decision CTAs, not as a hero dashboard card

#### Scenario: Failure soft
- **WHEN** monthly-comparison fails or is forbidden
- **THEN** Today still presents the recommendation decision surface

### Requirement: Ad-hoc entry on Today
Today SHALL offer a secondary Generate Ad-Hoc Workout action when the Bearer generate API is available. The action MUST NOT replace Accept, Analyze Readiness, or planned-only primary decisions. The app MUST NOT show a decorative ad-hoc CTA when the endpoint is unavailable (401/missing scope).

#### Scenario: Secondary with recommendation
- **WHEN** today’s recommendation is present and ad-hoc generate is Bearer-available
- **THEN** Today shows Generate Ad-Hoc Workout as a secondary action

#### Scenario: Available without recommendation
- **WHEN** there is no recommendation (empty or planned-only) and ad-hoc generate is Bearer-available
- **THEN** Today still offers Generate Ad-Hoc Workout as a non-primary action

#### Scenario: Unavailable
- **WHEN** ad-hoc generate is not Bearer-available
- **THEN** Today does not show a fake Generate Ad-Hoc Workout button

#### Scenario: In flight
- **WHEN** ad-hoc generation is running
- **THEN** the generate CTA is disabled or shows a generating state

### Requirement: Secondary recommendation tooling
View Details and Refine SHALL remain secondary to Accept / Accept rest day. Opening either sheet MUST NOT auto-accept suggested modifications.

#### Scenario: Opening details does not accept
- **WHEN** the user opens View Details while suggested modifications are pending
- **THEN** the recommendation remains unaccepted until the user explicitly accepts

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

