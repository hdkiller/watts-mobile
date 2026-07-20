## ADDED Requirements

### Requirement: Training Load and Form glance on Today
The Today tab SHALL show a compact read-only Training Load & Form glance with current Fitness (CTL), Fatigue (ATL), and Form (TSB) values from the performance PMC summary when the query succeeds. Form SHALL include the API-provided form status label (and status color treatment when available). The glance MUST NOT render a multi-day PMC chart or CTL grid on the Today tab itself.

#### Scenario: Summary present
- **WHEN** `GET /api/performance/pmc` returns a summary with CTL, ATL, and TSB
- **THEN** Today shows those three values in a compact Training Load & Form glance with form status

#### Scenario: No chart on tab
- **WHEN** the Training Load & Form glance renders on Today
- **THEN** it does not show a PMC line chart or calendar heatmap

#### Scenario: Query failure
- **WHEN** the PMC query fails or is forbidden
- **THEN** Today omits the glance or shows a quiet unavailable state and MUST NOT block the recommendation decision surface

### Requirement: Training Load and Form sheet
Tapping the Training Load & Form glance SHALL open a read-only sheet titled “Training Load & Form”. The sheet SHALL show summary cards for Fitness (CTL), Fatigue (ATL), and Form (TSB) (and MAY show Avg TSS), a period selector including at least 30, 60, and 90 days, and a simplified PMC line chart for CTL, ATL, and TSB over the selected period.

#### Scenario: Open sheet
- **WHEN** the athlete taps the Training Load & Form glance
- **THEN** the Training Load & Form sheet opens

#### Scenario: Change period
- **WHEN** the athlete selects a different period in the sheet
- **THEN** the sheet reloads PMC data for that period and updates the chart and summary

#### Scenario: Chart series
- **WHEN** PMC series data is available for the selected period
- **THEN** the sheet charts CTL, ATL, and TSB over time with a clear legend

### Requirement: Performance read scope
The companion OAuth client SHALL request `performance:read` so PMC requests succeed for newly authorized sessions. When an existing session lacks the scope, the glance/sheet SHALL fail closed with an honest unavailable or re-auth cue rather than inventing values.

#### Scenario: Scope included
- **WHEN** a user completes companion OAuth after this change
- **THEN** the authorized scope set includes `performance:read`

#### Scenario: Missing scope
- **WHEN** PMC returns 403 because `performance:read` is absent
- **THEN** the UI does not show fabricated CTL/ATL/TSB numbers

### Requirement: Open web performance escape
The Training Load & Form sheet SHALL offer Open web that opens the instance `/performance` (or equivalent performance analytics path) in the system browser. The app MUST NOT ship a full in-app performance analytics explorer in this change.

#### Scenario: Open web
- **WHEN** the athlete chooses Open web from the Training Load & Form sheet
- **THEN** the system browser opens the instance performance analytics surface
