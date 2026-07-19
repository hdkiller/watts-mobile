# upcoming-planned Delta — Planned Strength Structure

## MODIFIED Requirements

### Requirement: Richer planned structure summary
When the planned workout payload includes structure data, the planned detail screen SHALL present a compact summary of that structure in addition to title and key metrics.

For endurance-shaped payloads, structure means top-level interval/step data (`structuredWorkout.steps` or `intervals`): at least name and duration when present. When at least two of those steps carry positive durations, the screen SHALL additionally render a compact graphical intensity profile above the step list — block width proportional to step duration, block height/color derived from step intensity via the shared zone ramp, with a neutral fill for steps whose intensity cannot be confidently determined.

For strength-shaped payloads, structure means canonical `structuredWorkout.blocks` (preferred) or legacy `exercises`: the screen SHALL list exercises with name and a compact prescription summary when present (sets, reps/value, load, rest). The system MUST NOT invent exercises or prescription values when those fields are absent. The intensity-profile graphic MUST NOT be shown for strength-shaped structure.

#### Scenario: Endurance structure present
- **WHEN** the planned workout detail includes interval or step structure
- **THEN** the detail screen shows a compact structure summary

#### Scenario: Intensity profile rendered
- **WHEN** two or more endurance structure steps have positive durations
- **THEN** a horizontal intensity-profile graphic appears above the step list with block widths proportional to duration

#### Scenario: Unparseable intensity stays honest
- **WHEN** an endurance step's intensity cannot be confidently parsed
- **THEN** its profile block uses a neutral color and mid height rather than an invented zone

#### Scenario: Strength blocks present
- **WHEN** the planned workout `structuredWorkout` includes non-empty `blocks` with exercise steps
- **THEN** the detail screen shows those exercises with names and compact prescription text when available

#### Scenario: Strength exercises fallback
- **WHEN** `blocks` are absent but `structuredWorkout.exercises` is a non-empty array
- **THEN** the detail screen shows a compact exercise list from that array

#### Scenario: Strength has no intensity profile
- **WHEN** the mapped structure comes from strength `blocks` or `exercises`
- **THEN** the detail screen does not render the duration×intensity profile graphic

#### Scenario: Structure absent
- **WHEN** the planned workout has no structure fields
- **THEN** the detail screen still shows available title/metrics/description and MUST NOT invent intervals or exercises
