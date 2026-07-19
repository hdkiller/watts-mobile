## ADDED Requirements

### Requirement: Lite activity summary metrics
The lite activity summary screen SHALL show a compact summary of completed-workout metrics when `GET /api/workouts/:id?includeStreams=false` includes them, without loading streams or porting analysis charts.

Displayed metrics MAY include distance (`distanceMeters`), average power (`averageWatts`), normalized power (`normalizedPower`), average heart rate (`averageHr`), elevation gain (`elevationGain`), and intensity factor (`intensity`) when each value is present and finite. The system MUST omit individual metrics that are absent and MUST omit the entire summary-metrics section when none are present. The system MUST NOT invent placeholder zeros.

#### Scenario: Metrics present
- **WHEN** the workout payload includes one or more of distance, average/normalized power, average HR, elevation, or intensity
- **THEN** the summary screen shows those present metrics in a compact labeled layout

#### Scenario: Metrics absent
- **WHEN** the workout payload has none of the summary metric fields
- **THEN** the summary screen does not show an empty metrics section

#### Scenario: Streams remain off
- **WHEN** the app loads activity summary
- **THEN** it requests the workout with `includeStreams=false` (or equivalent) and does not render stream charts

## MODIFIED Requirements

### Requirement: Lite activity summary
Tapping a workout SHALL open a lite summary stack screen with core fields (title, date, duration, load/TSS when present) and, when available, the lite summary metrics defined in this change.

#### Scenario: Open summary
- **WHEN** the user taps a workout row
- **THEN** the app navigates to that workout’s summary screen

#### Scenario: Core fields still shown
- **WHEN** the summary screen loads successfully
- **THEN** the user sees title and available date/duration/load fields even if summary metrics are absent
