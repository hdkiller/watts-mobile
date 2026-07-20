## ADDED Requirements

### Requirement: Ad-hoc entry on Today
Today SHALL offer a secondary Generate Ad-Hoc Workout action when the Bearer generate API is available. The action MUST NOT replace Accept, Analyze Readiness, or planned-only primary decisions. The app MUST NOT show a decorative ad-hoc CTA when the endpoint is unavailable (401/missing scope).

#### Scenario: Secondary with recommendation
- **WHEN** today’s recommendation is present and ad-hoc generate is Bearer-available
- **THEN** Today shows Generate Ad-Hoc Workout as a secondary action

#### Scenario: Available without recommendation
- **WHEN** there is no recommendation (empty or planned-only) and ad-hoc generate is Bearer-available
- **THEN** Today still offers Generate Ad-Hoc Workout as a non-primary action

#### Scenario: Unavailable
- **WHEN** ad-hoc generate is not Bearer-available
- **THEN** Today does not show a fake Generate Ad-Hoc Workout button

#### Scenario: In flight
- **WHEN** ad-hoc generation is running
- **THEN** the generate CTA is disabled or shows a generating state
