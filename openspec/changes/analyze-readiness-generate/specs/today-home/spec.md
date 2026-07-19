## MODIFIED Requirements

### Requirement: Empty and loading states
The Today tab SHALL show a loading state while fetching and a clear empty state when no recommendation exists for today and no planned workout is available. When no recommendation exists but today’s planned workout is available, the planned workout SHALL be the hero decision surface. Empty/no-recommendation states MAY offer Open web (instance) and Retry. When the Bearer Analyze Readiness generate API is available, the empty (no recommendation, no planned-only hero) state SHALL offer Analyze Readiness; the app MUST NOT present a fake generate action when that API is unavailable.

#### Scenario: No recommendation
- **WHEN** the today recommendation API returns null/empty and there is no planned workout for today
- **THEN** the user sees an honest empty message (not a blank screen) and a way to open the web app or retry

#### Scenario: Planned-only hero
- **WHEN** there is no recommendation but today’s planned workout is available
- **THEN** Today presents that planned workout as the primary decision surface (not only a secondary empty card)

#### Scenario: Analyze Readiness available
- **WHEN** there is no recommendation and no planned-only hero and generate is Bearer-available
- **THEN** Today shows Analyze Readiness as a primary empty-state action

#### Scenario: Analyze Readiness unavailable
- **WHEN** generate is not Bearer-available
- **THEN** Today does not show a decorative Analyze Readiness button
