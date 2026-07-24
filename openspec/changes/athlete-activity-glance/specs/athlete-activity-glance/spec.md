## ADDED Requirements

### Requirement: Rolling twelve-week activity glance on Athlete
The Athlete destination SHALL show a rolling activity glance of twelve Monday-start week columns and seven day circles per column, covering ten weeks before the current week through the end of the current week plus two weeks forward. The glance MUST NOT appear on Today.

#### Scenario: Glance visible on Athlete
- **WHEN** the athlete opens Athlete from Today name or More
- **THEN** the screen shows the twelve-week day-circle glance

#### Scenario: Not on Today
- **WHEN** the athlete views the Today tab
- **THEN** the twelve-week activity glance is not rendered (Today may still show the existing seven-day week strip)

### Requirement: Day cell states
Each day circle SHALL encode at most: completed workout (filled), planned upcoming session (soft outline), empty/rest (dim), and a distinct today affordance. The glance MUST NOT show streak counters, TSS intensity levels, or a compliance legend.

#### Scenario: Completed day
- **WHEN** at least one completed workout falls on a local calendar day in the glance window
- **THEN** that day’s circle is shown as filled (done)

#### Scenario: Planned future day
- **WHEN** a day is on or after today, has no completed workout, and has at least one planned workout
- **THEN** that day’s circle is shown as a soft outline (planned)

#### Scenario: Rest day
- **WHEN** a day in the window has neither completed nor planned workouts
- **THEN** that day’s circle is shown as empty/dim

### Requirement: Count header
The glance SHALL show a short header with counts of days (or sessions, consistently) with completed workouts and with upcoming planned workouts in the glance window (e.g. `N done · M planned`). Streak metrics MUST NOT be shown.

#### Scenario: Header with activity
- **WHEN** the glance data includes completed and planned items in range
- **THEN** the header shows done and planned counts without streak labels

### Requirement: Day tap navigation
Tapping a day SHALL open activity detail when exactly one completed workout matches that day; SHALL open planned detail when exactly one planned workout matches and there is no completed workout that day; otherwise SHALL navigate to Recent (past/today multi or empty past) or Upcoming (future multi or empty future) as appropriate.

#### Scenario: Single completed workout
- **WHEN** the athlete taps a day with exactly one completed workout
- **THEN** the app opens that activity’s detail

#### Scenario: Single planned workout
- **WHEN** the athlete taps a future day with exactly one planned workout and no completed workout
- **THEN** the app opens that planned workout’s detail

#### Scenario: Multiple sessions
- **WHEN** the athlete taps a day with more than one matching session
- **THEN** the app opens the Recent or Upcoming list rather than picking arbitrarily

### Requirement: Glance-scoped data and honest states
The glance SHALL load completed and planned workouts for its window via dedicated queries that do not change Today’s default recent/upcoming list limits. While loading, the glance SHALL show a skeleton (not a full-screen blocker). On error, the glance SHALL show an honest inline error with retry. When the window has no done and no planned items, the glance SHALL show an honest empty affordance without fabricating activity.

#### Scenario: Loading
- **WHEN** glance queries are pending and no cached data is shown
- **THEN** a skeleton placeholder is shown for the glance region

#### Scenario: Error
- **WHEN** a glance query fails
- **THEN** an inline error with retry is shown and the rest of Athlete remains usable

#### Scenario: Empty window
- **WHEN** glance queries succeed and no completed or planned workouts fall in the window
- **THEN** the glance shows empty day circles and honest zero counts (or an empty message) without invented sessions

### Requirement: Calendar-stable local dates
Day bucketing SHALL use local calendar dates and MUST treat date-only API strings (and UTC-midnight date representations) as calendar-stable local days, consistent with Today week glance rules.

#### Scenario: Date-only planned date
- **WHEN** a planned workout date is a `YYYY-MM-DD` date-only string
- **THEN** it is bucketed into that local calendar day in the athlete’s timezone rather than shifted by UTC midnight
