## MODIFIED Requirements

### Requirement: Open web for full settings
The Athlete screen SHALL offer Open web (or equivalent) for settings beyond the metrics subset rather than porting full Profile Settings. Display unit preferences (distance, weight units used for formatting, temperature, timezone) are edited under Settings → Units & locale, not on the Athlete metrics form (except weight value itself and its unit when entering weight).

#### Scenario: Open web from Athlete
- **WHEN** the user chooses Open web from Athlete
- **THEN** the system browser opens the configured instance (profile/settings path when known, otherwise instance home)

#### Scenario: Units live in Settings
- **WHEN** the user wants to change distance or temperature display units
- **THEN** the Athlete metrics screen directs them to Settings → Units & locale (or those controls are absent from Athlete in favor of Settings)
