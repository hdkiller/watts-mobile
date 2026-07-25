## ADDED Requirements

### Requirement: Share completed activity
The activity summary screen SHALL offer a Share action that mints an attributed public workout share link and opens the system Share sheet per `native-content-share`. Share MUST NOT replace Open web for deep analysis surfaces.

#### Scenario: Share from activity summary
- **WHEN** the athlete opens a completed activity summary and taps Share
- **THEN** the app mints a `WORKOUT` public share URL, attributes it when a referral code is available, and opens the OS Share sheet

#### Scenario: Share control is discoverable
- **WHEN** the activity summary has loaded successfully
- **THEN** a Share affordance is visible without requiring Open web
