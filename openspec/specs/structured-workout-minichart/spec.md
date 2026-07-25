# structured-workout-minichart Specification

## Purpose
TBD - created by archiving change structured-workout-minichart-parity. Update Purpose after archive.
## Requirements
### Requirement: Target-aware step intensity for charts
The system SHALL derive endurance structure chart intensity from raw `structuredWorkout` step targets (`power`, `heartRate`, `pace`, and related percent fields), not solely from display intensity labels. Resolution MUST follow coach-wattz chart semantics in priority order: zone-unit targets via `zoneProfileSnapshot` bands when present; percent / `%FTP` / relative pace on the step; absolute watts / bpm / pace divided by available athlete thresholds (FTP, LTHR, threshold pace) when present; then best-effort label parse. When intensity cannot be resolved honestly, the system MUST use a neutral fill and MUST NOT invent thresholds or zone membership.

#### Scenario: Percent FTP target colors
- **WHEN** a step target is expressed as a percent of FTP (units or percent fields)
- **THEN** the chart block uses a zone color and height derived from that relative intensity

#### Scenario: Absolute watts with FTP
- **WHEN** a step target is absolute watts and an athlete FTP is available
- **THEN** the chart block colors and sizes from watts ÷ FTP mapped into the zone ramp

#### Scenario: Absolute watts without FTP
- **WHEN** a step target is absolute watts and no FTP (or equivalent threshold) is available
- **THEN** the chart block uses the neutral fill rather than guessing a zone

#### Scenario: Zone-unit HR target
- **WHEN** a step uses heart-rate zone units and `zoneProfileSnapshot` includes HR bands
- **THEN** the chart block uses the corresponding zone color from the shared companion ramp

### Requirement: Endurance structure mini-chart rendering
For endurance-shaped planned structure, when at least two chartable steps have positive durations, the system SHALL render a compact horizontal intensity silhouette: block width proportional to duration, block height from relative intensity (capped around 120% scale), and block color from the shared zone ramp when intensity resolves. Ramp steps MUST render as start→end height wedges when ramp target data is present. Repeat parents MUST expand child steps into the chart according to reps (with a documented cap) rather than omitting repeated work. Strength-shaped structure MUST NOT use this endurance silhouette.

#### Scenario: Steady intervals silhouette
- **WHEN** an endurance planned workout has multiple timed steady steps with resolvable intensity
- **THEN** the silhouette shows duration-proportional, zone-colored blocks

#### Scenario: Ramp step wedge
- **WHEN** a timed step includes ramp target data
- **THEN** that block renders as a wedge from start intensity height to end intensity height

#### Scenario: Repeat expansion in chart
- **WHEN** a structured step repeats nested children more than once
- **THEN** the silhouette includes the child bars once per repetition up to the documented cap

#### Scenario: Strength excluded
- **WHEN** structure is strength-shaped (`blocks` or legacy `exercises`)
- **THEN** the endurance mini-chart is not rendered

### Requirement: Honest intensity labels for percent and zone units
When mapping step targets into display `intensityLabel` text for the planned structure list, the system MUST NOT present percent / `%FTP` power targets as watts. Zone-unit targets MUST continue to surface zone labels (with band ranges when snapshot bands exist).

#### Scenario: Percent power not shown as watts
- **WHEN** a step power target uses percent or `%FTP` units
- **THEN** the structure list label expresses percent (or zone), not a fabricated watt value

### Requirement: Optional list glance without N+1 fetches
The system MAY show a compact endurance mini-chart on Upcoming or Today Coming-up rows only when previewable structured workout data is already present on that list/aggregate payload. The system MUST NOT fetch planned detail per row solely to render list mini-charts, and MUST NOT introduce a calendar heatmap.

#### Scenario: List chart when preview present
- **WHEN** an upcoming planned row includes previewable endurance structure data
- **THEN** the row MAY show a compact mini-chart and tapping the row still opens planned detail

#### Scenario: No per-row detail fan-out
- **WHEN** list/aggregate payloads omit structure preview data
- **THEN** the list does not issue per-row planned-detail requests to synthesize mini-charts

