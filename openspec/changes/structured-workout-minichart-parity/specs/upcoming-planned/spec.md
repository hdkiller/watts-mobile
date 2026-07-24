## MODIFIED Requirements

### Requirement: Richer planned structure summary
When the planned workout payload includes structure data, the planned detail screen SHALL present a compact summary of that structure in addition to title and key metrics.

For endurance-shaped payloads, structure means top-level interval/step data (`structuredWorkout.steps` or `intervals`): at least name and duration when present. When at least two of those steps carry positive durations, the screen SHALL additionally render a compact graphical intensity profile above the step list — block width proportional to step duration, block height/color derived from **target-aware** step intensity (raw power / heart-rate / pace targets, zone profile snapshot, and available athlete thresholds) via the shared zone ramp, with a neutral fill for steps whose intensity cannot be confidently determined. Display intensity labels MUST NOT misrepresent percent / `%FTP` targets as watts. The intensity profile SHALL expand repeated nested steps into the chart (capped) and SHALL render ramp steps as start→end height wedges when ramp target data is present.

For strength-shaped payloads, structure means canonical `structuredWorkout.blocks` (preferred) or legacy `exercises`: the screen SHALL list exercises with name and a compact prescription summary when present (sets, reps/value, load, rest). The system MUST NOT invent exercises or prescription values when those fields are absent. The intensity-profile graphic MUST NOT be shown for strength-shaped structure.

#### Scenario: Endurance structure present
- **WHEN** the planned workout detail includes interval or step structure
- **THEN** the detail screen shows a compact structure summary

#### Scenario: Intensity profile rendered
- **WHEN** two or more endurance structure steps have positive durations
- **THEN** a horizontal intensity-profile graphic appears above the step list with block widths proportional to duration

#### Scenario: Watt targets color when FTP available
- **WHEN** endurance steps use absolute watt targets and athlete FTP is available
- **THEN** profile blocks use zone colors derived from watts relative to FTP rather than neutral gray

#### Scenario: Unresolvable intensity stays honest
- **WHEN** an endurance step's intensity cannot be confidently resolved from targets, snapshot, thresholds, or labels
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

## ADDED Requirements

### Requirement: Compact structure glance on Upcoming when preview data exists
When an upcoming planned list item includes previewable endurance `structuredWorkout` data on the list payload itself, the Upcoming row (and Today Coming-up teaser row, when shown) MAY render a compact mini-chart using the same target-aware intensity rules as planned detail. The system MUST NOT perform per-row planned-detail fetches solely to draw these charts, and Upcoming MUST remain a list (or day-grouped list), not a calendar heatmap.

#### Scenario: Preview present on list row
- **WHEN** an upcoming planned item includes previewable endurance structure on the list payload
- **THEN** the row MAY show a compact structure mini-chart without leaving the list

#### Scenario: Preview absent
- **WHEN** the list payload omits structure preview data
- **THEN** the row shows existing title/meta only and does not fan out detail requests for charts
