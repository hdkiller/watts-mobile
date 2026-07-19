## MODIFIED Requirements

### Requirement: Coming up planned teaser on Today
The Today tab SHALL show a thin Coming up strip of upcoming **planned workouts** (reusing the existing upcoming-planned query contract), capped to roughly the next 2–3 sessions (or next ~3–7 days), and MAY include a quiet next race/life **event** line or row when upcoming events exist. “See all” SHALL navigate to `/(app)/upcoming`. The strip MUST NOT be a full calendar or heatmap.

#### Scenario: Upcoming sessions present
- **WHEN** upcoming planned workouts are available
- **THEN** Today shows a short teaser list with title/date (and type or duration when available) and a See all control that opens Upcoming

#### Scenario: No upcoming sessions
- **WHEN** the upcoming planned query returns an empty list and there is no next event
- **THEN** Today shows a quiet empty line or omits dense empty chrome without blocking the decision hero

#### Scenario: Planned workouts remain primary rows
- **WHEN** Coming up renders planned workouts on Today
- **THEN** planned rows still come from the planned-workouts API and are visually distinct from any event row

#### Scenario: Next event in Coming up
- **WHEN** at least one upcoming race/life event exists
- **THEN** Coming up MAY show a single next-event line (title + days) without replacing planned workout rows

## ADDED Requirements

### Requirement: Next-event countdown on Today
The Today tab SHALL show a thin next-event countdown (title + days until) when an upcoming race/life event exists, placed so it does not compete with the primary morning decision (below primary CTAs / with glances). When no upcoming event exists, the countdown MUST be omitted (not shown as empty chrome).

#### Scenario: Event present
- **WHEN** the nearest future event is available
- **THEN** Today shows a compact countdown such as “{title} — {n} days”

#### Scenario: No upcoming event
- **WHEN** there are no future events
- **THEN** Today does not show a countdown chip or placeholder race
