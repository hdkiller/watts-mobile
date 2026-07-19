## ADDED Requirements

### Requirement: Planned intensity and status on detail
The planned workout detail screen SHALL show planned intensity (`workIntensity`) when present and finite, and SHALL show honest completion/sync status labels when `completionStatus` and/or `syncStatus` are present on `GET /api/planned-workouts/:id`. The system MUST NOT invent status progress the server did not supply.

#### Scenario: Intensity present
- **WHEN** the planned workout includes a finite `workIntensity`
- **THEN** the detail screen shows it as a compact intensity/IF label alongside other key metrics

#### Scenario: Status present
- **WHEN** the planned workout includes completion or sync status fields
- **THEN** the detail screen displays corresponding human-readable status text

#### Scenario: Intensity or status absent
- **WHEN** intensity or status fields are missing
- **THEN** the detail screen omits those labels rather than showing placeholders

### Requirement: Planned coach cues
When `structuredWorkout.coachInstructions` is a non-empty string, the planned detail screen SHALL show a short Coach cues section with that text (truncated for display if very long). The system MUST NOT invent coach cues when the field is absent or non-string.

#### Scenario: Coach instructions present
- **WHEN** the planned workout structured payload includes non-empty `coachInstructions`
- **THEN** the detail screen shows a Coach cues section with that text

#### Scenario: Coach instructions absent
- **WHEN** `coachInstructions` is missing or empty
- **THEN** the detail screen does not show a Coach cues section

### Requirement: Compact planned zone summary
When `structuredWorkout.zoneProfileSnapshot` includes zone ranges, the planned detail screen SHALL show a compact zone summary for one primary channel (preferring power, then heart rate, then pace) with named ranges and min–max values. The system MUST NOT invent zones when the snapshot is absent or empty, and MUST NOT render zone charts.

#### Scenario: Zone snapshot present
- **WHEN** the structured workout includes a zone profile snapshot with ranges
- **THEN** the detail screen shows a compact text list of those zones for a primary channel

#### Scenario: Zone snapshot absent
- **WHEN** the structured workout has no zone profile snapshot or empty ranges
- **THEN** the detail screen does not show a zones section
