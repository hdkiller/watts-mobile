# recommendation-actions Delta — Recommendation Hero States

## MODIFIED Requirements

### Requirement: Accept recommendation
The Today surface SHALL provide an Accept action that calls the coach-wattz accept endpoint for the current activity recommendation when the backend accepts Bearer tokens. After a successful accept (or when today's recommendation is already accepted), the primary CTA area SHALL replace the Accept button with a confirmed affordance — checkmark plus accepted copy — that links to the planned workout detail when a planned workout exists.

#### Scenario: Successful accept
- **WHEN** the user taps Accept and the API succeeds
- **THEN** Today refreshes and the Accept button is replaced by a confirmed state showing the recommendation was accepted

#### Scenario: Confirmed state links onward
- **WHEN** the accepted recommendation has an associated planned workout
- **THEN** tapping the confirmed affordance opens the planned workout detail
