## ADDED Requirements

### Requirement: Today reuses Log nutrition data for decision link
Today’s compact fuel-state decision link and post-CTA nutrition glance SHALL reuse the same Bearer nutrition day data and fuel-state labels as Log quick-log (`GET /api/nutrition` mapping). Meal, hydration, and photo writes MUST remain Log-first (or Coach photo path); Today MUST NOT add a parallel quick-log form in the decision band.

#### Scenario: Shared fuel state label
- **WHEN** today’s nutrition day has fuel state 1, 2, or 3
- **THEN** Today and Log present the same Eco / Steady / Performance (or current) vocabulary for that state

#### Scenario: No decision-band writes
- **WHEN** the athlete uses the fuel-state decision link on Today
- **THEN** the app does not present an inline meal-entry form on the Today hero
