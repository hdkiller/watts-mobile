## ADDED Requirements

### Requirement: Share planned workout
The planned workout detail screen SHALL offer a Share action that mints an attributed public planned-workout share link and opens the system Share sheet per `native-content-share`. Share MUST NOT imply Intervals publish or template save.

#### Scenario: Share from planned detail
- **WHEN** the athlete opens a planned workout detail and taps Share
- **THEN** the app mints a `PLANNED_WORKOUT` public share URL, attributes it when a referral code is available, and opens the OS Share sheet

#### Scenario: Share control is discoverable
- **WHEN** the planned workout detail has loaded successfully
- **THEN** a Share affordance is visible without requiring Open web
