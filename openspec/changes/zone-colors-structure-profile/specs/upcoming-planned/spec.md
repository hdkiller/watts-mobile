# upcoming-planned Delta — Zone Colors and Structure Profile

## MODIFIED Requirements

### Requirement: Richer planned structure summary
When the planned workout payload includes structure or interval/step data, the planned detail screen SHALL present a compact summary of those steps (at least name and duration when present) in addition to title and key metrics. When at least two steps carry positive durations, the screen SHALL additionally render a compact graphical intensity profile above the step list — block width proportional to step duration, block height/color derived from step intensity via the shared zone ramp, with a neutral fill for steps whose intensity cannot be confidently determined.

#### Scenario: Structure present
- **WHEN** the planned workout detail includes interval or step structure
- **THEN** the detail screen shows a compact structure summary

#### Scenario: Intensity profile rendered
- **WHEN** two or more structure steps have positive durations
- **THEN** a horizontal intensity-profile graphic appears above the step list with block widths proportional to duration

#### Scenario: Unparseable intensity stays honest
- **WHEN** a step's intensity cannot be confidently parsed
- **THEN** its profile block uses a neutral color and mid height rather than an invented zone

#### Scenario: Structure absent
- **WHEN** the planned workout has no structure fields
- **THEN** the detail screen still shows available title/metrics/description and MUST NOT invent intervals or render a profile

### Requirement: Compact planned zone summary
When `structuredWorkout.zoneProfileSnapshot` includes zone ranges, the planned detail screen SHALL show a compact zone summary for one primary channel (preferring power, then heart rate, then pace) with named ranges and min–max values, each row color-keyed with that zone's color from the shared zone ramp. The system MUST NOT invent zones when the snapshot is absent or empty, and MUST NOT render zone charts.

#### Scenario: Zone snapshot present
- **WHEN** the structured workout includes a zone profile snapshot with ranges
- **THEN** the detail screen shows a compact list of those zones for a primary channel with a zone-ramp color key per row

#### Scenario: Zone snapshot absent
- **WHEN** the structured workout has no zone profile snapshot or empty ranges
- **THEN** the detail screen does not show a zones section
