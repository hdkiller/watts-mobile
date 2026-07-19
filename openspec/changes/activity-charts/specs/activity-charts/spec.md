## ADDED Requirements

### Requirement: Stream charts on activity detail
The activity detail screen SHALL load workout streams via `GET /api/workouts/:id/streams` with Bearer `workout:read` and SHALL display a power and/or heart-rate over time chart when those series are present. The system MUST keep the summary/AI detail fetch streams-off (`includeStreams=false`).

#### Scenario: Power or HR series present
- **WHEN** the streams response includes `time` with `watts` and/or `heartrate` data
- **THEN** the activity detail screen shows a line chart for the available series

#### Scenario: No stream series
- **WHEN** streams are unavailable or lack power and HR series
- **THEN** the screen omits the stream chart rather than inventing data

### Requirement: Zone distribution chart
When the streams response includes zone time histograms (`powerZoneTimes` or `hrZoneTimes`) with zone definitions when available, the activity detail screen SHALL show a compact time-in-zone bar chart for a primary channel (prefer power, else heart rate).

#### Scenario: Zone times present
- **WHEN** zone sample counts are present for power or HR
- **THEN** the screen shows labeled zone bars proportional to time in each zone

#### Scenario: Zone times absent
- **WHEN** neither power nor HR zone histograms have data
- **THEN** the zone chart section is omitted

### Requirement: Power curve chart
The activity detail screen SHALL load `GET /api/workouts/:id/power-curve` and SHALL show a power-curve chart when `hasPowerData` is true.

#### Scenario: Power data available
- **WHEN** the power-curve response reports power data with curve points
- **THEN** the screen shows peak power by duration

#### Scenario: No power data
- **WHEN** the power-curve response has no power data
- **THEN** the power-curve section is omitted
