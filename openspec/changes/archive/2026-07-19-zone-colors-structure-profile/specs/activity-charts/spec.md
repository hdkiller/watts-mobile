# activity-charts Delta — Zone Colors and Structure Profile

## MODIFIED Requirements

### Requirement: Zone distribution chart
When the streams response includes zone time histograms (`powerZoneTimes` or `hrZoneTimes`) with zone definitions when available, the activity detail screen SHALL show a compact time-in-zone bar chart for a primary channel (prefer power, else heart rate). Each zone bar SHALL be filled with that zone's color from the shared zone ramp (Z1→Zn), in zone order.

#### Scenario: Zone times present
- **WHEN** zone sample counts are present for power or HR
- **THEN** the screen shows labeled zone bars proportional to time in each zone, each colored by the shared zone ramp

#### Scenario: Zone times absent
- **WHEN** neither power nor HR zone histograms have data
- **THEN** the zone chart section is omitted

#### Scenario: More zones than ramp entries
- **WHEN** the histogram contains more zones than the ramp defines
- **THEN** overflow zones reuse the last ramp color rather than failing to render
