## ADDED Requirements

### Requirement: Upcoming events section
The Upcoming screen SHALL show a small Events section (or equivalent thin list) of upcoming race/life events when any exist, in addition to the planned-workouts list. Event rows MUST NOT open planned-workout detail; they MAY open Open web for event depth or a read-only event summary if implemented later.

#### Scenario: Events present
- **WHEN** upcoming events exist and the user opens Upcoming
- **THEN** the screen shows those events with title and date (and priority/type when available)

#### Scenario: Events absent
- **WHEN** there are no upcoming events
- **THEN** the Upcoming screen omits the Events section rather than showing dense empty chrome

### Requirement: Still no calendar heatmap
Upcoming MUST remain a list (day-grouped allowed), not a calendar heatmap, month grid, or CTL visualization, even after events are added.

#### Scenario: No heatmap with events
- **WHEN** the user opens Upcoming with both planned workouts and events
- **THEN** the UI does not present a calendar heatmap
