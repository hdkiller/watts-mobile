## MODIFIED Requirements

### Requirement: Training Load and Form glance on Today
The Today tab SHALL show a compact read-only Training Load & Form glance with current Fitness (CTL), Fatigue (ATL), and Form (TSB) values from the performance PMC summary when the query succeeds. Each metric SHALL show a compact ±% trend vs the mean of the prior ~7 PMC series days when that history exists (ATL lower-is-better; CTL/TSB higher-is-better). Form SHALL include the API-provided form status label (and status color treatment when available). TSB SHALL display a leading `+` when the value is positive. The glance MUST NOT render a multi-day PMC chart or CTL grid on the Today tab itself.

#### Scenario: Summary present with trends
- **WHEN** `GET /api/performance/pmc` returns a summary and enough prior series days
- **THEN** Today shows CTL, ATL, and TSB with ±% trend badges and form status

#### Scenario: Insufficient history for trend
- **WHEN** summary values exist but prior series is empty
- **THEN** Today still shows CTL/ATL/TSB values and omits trend badges rather than inventing percentages

#### Scenario: No chart on tab
- **WHEN** the Training Load & Form glance renders on Today
- **THEN** it does not show a PMC line chart or calendar heatmap

#### Scenario: Query failure
- **WHEN** the PMC query fails or is forbidden
- **THEN** Today omits the glance or shows a quiet unavailable / re-auth state and MUST NOT block the recommendation decision surface or fabricate CTL/ATL/TSB numbers
