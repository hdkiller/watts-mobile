## ADDED Requirements

### Requirement: Expanded health data disclosure for comprehensive sync
Store privacy disclosures (App Privacy / Data safety questionnaires and in-app copy) SHALL reflect the comprehensive Health Sync read set and background collection when Health Sync is enabled: heart-rate streams, steps and daily activity volume, distance, and — when workout sync is on — GPS route / location data from workouts, collected periodically in the background. Disclosures MUST state that sync is opt-in and that disabling it (or signing out) stops background collection.

#### Scenario: Route/location disclosed when workouts sync
- **WHEN** the store privacy copy describes Health Sync with workouts enabled
- **THEN** it discloses that workout GPS route / location data may be uploaded to the athlete's instance

#### Scenario: Background collection disclosed
- **WHEN** the App Privacy / Data safety form is completed for a build including comprehensive Health Sync
- **THEN** health/fitness and location categories are marked as collected in the background under an opt-in control
