## ADDED Requirements

### Requirement: Recent Wellness glance on Today
The Today tab SHALL show a read-only Recent Wellness glance sourced from Bearer wellness/profile APIs (not from recommendation `analysisJson`). The glance SHALL present Sleep, HRV, and resting heart rate (RHR) when each value is present and finite, each with an appropriate unit. The system MUST omit individual metrics that are null/absent and MUST NOT invent placeholder zeros. The glance MUST NOT render a wellness check-in form.

#### Scenario: Metrics present
- **WHEN** the latest wellness/profile aggregate includes one or more of Sleep, HRV, or RHR
- **THEN** Today shows those present metrics in a compact Recent Wellness glance

#### Scenario: All metrics absent
- **WHEN** no Sleep, HRV, or RHR values are available
- **THEN** Today still shows the Recent Wellness glance with the copy “No recent wellness · Check in” (or equivalent) and MUST NOT invent metric values

#### Scenario: Independent of recommendation
- **WHEN** there is no recommendation for today but recent wellness metrics exist
- **THEN** the Recent Wellness glance still appears with those metrics

#### Scenario: No second form
- **WHEN** the athlete views Recent Wellness on Today
- **THEN** the glance is read-only and does not include readiness/sleep-quality editors

### Requirement: Trend percent vs recent average
When a metric has a current value and a trailing multi-day history with at least one prior non-null value, the glance SHALL show a compact percent change versus the mean of those prior values in the trend window (approximately 7 days). Sleep and HRV SHALL use higher-is-better coloring; RHR SHALL use lower-is-better coloring. The system MUST omit the percent when history is insufficient.

#### Scenario: History supports trend
- **WHEN** RHR (or Sleep/HRV) has a current value and prior values in the trend window
- **THEN** the glance shows a rounded percent delta for that metric

#### Scenario: No history
- **WHEN** a metric has a current value but no prior values in the trend window
- **THEN** the glance shows the value without a trend percent

### Requirement: Stale wellness caption
When the latest wellness date is not the athlete’s local today, the glance SHALL include a short stale caption (for example yesterday or N days ago) rather than implying the values are from today.

#### Scenario: Latest wellness not today
- **WHEN** `latestWellnessDate` / equivalent is before local today
- **THEN** the glance shows a short stale caption alongside the metrics

#### Scenario: Current day wellness
- **WHEN** wellness for local today is present
- **THEN** the glance does not show a stale “N days ago” caption

### Requirement: Check in affordance from glance
The Recent Wellness glance SHALL offer a distinct Check in control that opens the Log tab wellness surface without embedding the form on Today. Check in MUST remain available in the empty state (“No recent wellness · Check in”).

#### Scenario: Open check in
- **WHEN** the user chooses Check in from the glance
- **THEN** the app navigates to the Log tab wellness section when supported

#### Scenario: Check in when empty
- **WHEN** no Sleep, HRV, or RHR values are available and the user chooses Check in
- **THEN** the app navigates to the Log tab wellness section when supported

### Requirement: Inline expandable seven-day trend bars
When trend series are loaded, the glance SHALL support expanding and collapsing compact 7-day bar charts for Sleep, HRV, and RHR inline on Today. Bars MUST start collapsed, MUST use the same trend series as the percent calculation, and MUST be omitted for a metric when that series is empty. Expanding bars MUST NOT open a separate Wellness Overview modal.

#### Scenario: Expand bars
- **WHEN** the user expands the Recent Wellness glance and at least one metric has trend points
- **THEN** the glance shows compact 7-day bars inline for metrics that have series data

#### Scenario: Collapse bars
- **WHEN** the user collapses the glance after expanding
- **THEN** the 7-day bars hide and the tile row remains visible

#### Scenario: Trend series empty
- **WHEN** a metric has no points in the trend window
- **THEN** no bar chart is shown for that metric

### Requirement: Sleep HRV RHR only
The Recent Wellness glance SHALL include only Sleep, HRV, and RHR metric tiles. The system MUST NOT add Recovery %, Readiness, Body Fat, SpO2, or blood pressure to this glance in this change.

#### Scenario: Fixed metric set
- **WHEN** the dashboard aggregate includes additional wellness fields beyond Sleep, HRV, and RHR
- **THEN** those extra fields are not shown as tiles in the Recent Wellness glance
