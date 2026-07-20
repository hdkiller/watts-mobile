# wellness-overview Specification

## Purpose
TBD - created by archiving change today-wellness-overview. Update Purpose after archive.
## Requirements
### Requirement: Wellness Overview sheet
The app SHALL present a read-only Wellness Overview sheet titled “Wellness Overview” that explains the athlete’s latest wellness day. The sheet SHALL show the wellness date and a stale indication when that date is not the athlete’s local today. The sheet MUST NOT embed wellness editors or trigger AI analyze jobs.

#### Scenario: Open overview
- **WHEN** the athlete opens Wellness Overview from Today’s Recent Wellness glance
- **THEN** a sheet presents the Wellness Overview for the latest wellness date (or local today when that is the latest)

#### Scenario: Stale day
- **WHEN** the wellness date shown is before local today
- **THEN** the sheet indicates the data is not from today (caption and/or warning treatment)

#### Scenario: Read-only
- **WHEN** the athlete views Wellness Overview
- **THEN** there are no mood/stress/fatigue editors and no Analyze with AI action

### Requirement: Key metrics grid
Wellness Overview SHALL show a compact metrics grid for non-null values among at least: HRV, Sleep, resting heart rate, recovery score, readiness, weight, stress, and mood. The system MUST omit null metrics and MUST NOT invent zeros. Each shown metric MAY include a compact trend percent versus recent history when the wellness payload provides sufficient prior values.

#### Scenario: Partial metrics
- **WHEN** only Sleep and HRV are present on the wellness day
- **THEN** the grid shows those metrics and omits the others

#### Scenario: Trend percent when history exists
- **WHEN** a metric has a current value and prior values in the wellness trends payload
- **THEN** the metric tile shows a compact percent delta consistent with higher-is-better or lower-is-better rules for that metric

### Requirement: Seven-day trend charts
Wellness Overview SHALL show compact 7-day trend bars for Sleep, HRV, and resting heart rate when each series has points. When a recovery-score history series is present and non-empty, the sheet SHALL also show a recovery trend. Empty series MUST be omitted.

#### Scenario: Core biometric trends
- **WHEN** Sleep, HRV, and RHR histories include points in the trends payload
- **THEN** the sheet shows a 7-day bar chart for each

#### Scenario: Empty series omitted
- **WHEN** a metric has no history points
- **THEN** no trend chart is shown for that metric

### Requirement: Coaching cue without analyze CTA
When the wellness payload includes an AI executive summary or recommendation string, Wellness Overview SHALL show a short read-only coach note. When AI text is absent, the sheet MAY show a short heuristic training cue derived from recovery/HRV/sleep/RHR. The sheet MUST NOT offer Analyze with AI or Regenerate.

#### Scenario: AI note present
- **WHEN** the wellness day includes a completed AI executive summary or recommendation
- **THEN** the sheet shows that text in a compact coach note

#### Scenario: No AI note
- **WHEN** AI analysis fields are empty
- **THEN** the sheet omits the AI note or shows only a heuristic cue and does not show an Analyze CTA

### Requirement: Check in and Open web escapes
Wellness Overview SHALL offer Check in that navigates to the Log tab wellness surface, and Open web that opens the instance wellness/fitness day (or dashboard wellness focus) in the system browser. Neither action MAY PATCH wellness from the sheet.

#### Scenario: Check in from overview
- **WHEN** the athlete chooses Check in in Wellness Overview
- **THEN** the app navigates to the Log tab wellness section when supported and closes or dismisses the sheet

#### Scenario: Open web from overview
- **WHEN** the athlete chooses Open web in Wellness Overview
- **THEN** the system browser opens the instance web wellness surface for further tools

