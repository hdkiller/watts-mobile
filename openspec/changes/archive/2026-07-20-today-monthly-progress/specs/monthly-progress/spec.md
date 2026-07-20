## ADDED Requirements

### Requirement: Monthly Progress glance on Today
The Today tab SHALL offer a compact Monthly Progress glance showing the current month-to-date total for a selected metric (default TSS) and the delta % vs last month when comparison data is available. The glance MUST NOT host the full chart or settings chrome on the tab itself.

#### Scenario: Comparison present
- **WHEN** `GET /api/stats/monthly-comparison` succeeds with current and last month totals
- **THEN** Today shows Monthly Progress with the current total and delta %

#### Scenario: Empty / error
- **WHEN** the query fails, is forbidden, or returns no workouts
- **THEN** Today omits the glance or shows a quiet empty/unavailable state and MUST NOT block the recommendation decision surface

### Requirement: Monthly Progress sheet
Tapping the Monthly Progress glance SHALL open a read-only sheet with metric selector (TSS, Duration, Distance, Elevation, Count), sport filter (All + available sports), Cumulative vs Daily view mode, a simplified current-vs-last-month chart, and footer totals with delta %.

#### Scenario: Open sheet
- **WHEN** the athlete taps Monthly Progress
- **THEN** the sheet opens with chart and selectors

#### Scenario: Change metric or sport
- **WHEN** the athlete changes metric or sport
- **THEN** the sheet reloads comparison data and updates chart and footer

### Requirement: Workout read scope
The companion OAuth client SHALL request `workout:read` so monthly-comparison requests succeed. Missing scope MUST fail closed without fabricated progress numbers.

#### Scenario: Missing scope
- **WHEN** monthly-comparison returns 403
- **THEN** the UI does not invent month totals or delta %

### Requirement: Open web escape
The Monthly Progress sheet SHALL offer Open web to the instance dashboard (or equivalent) for full web widget chrome.

#### Scenario: Open web
- **WHEN** the athlete chooses Open web from the sheet
- **THEN** the system browser opens the instance dashboard via session handoff when available
