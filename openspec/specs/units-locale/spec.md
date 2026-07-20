# units-locale Specification

## Purpose
TBD - created by archiving change settings-field-companion. Update Purpose after archive.
## Requirements
### Requirement: Units & locale entry
Settings SHALL provide a Units & locale screen reachable from the General section.

#### Scenario: Open Units & locale
- **WHEN** the authenticated user chooses Units & locale in Settings
- **THEN** the app opens a screen to view and edit display units and timezone

### Requirement: Load units and timezone from profile
The Units & locale screen SHALL load current values via Bearer `GET /api/profile` (`profile:read`), including distance units, weight units, temperature units, and timezone when the API provides them.

#### Scenario: Values load
- **WHEN** the screen opens and the profile request succeeds
- **THEN** the user sees the current distance, weight, temperature, and timezone preferences

#### Scenario: Load error
- **WHEN** the profile request fails
- **THEN** the user sees a recoverable error with retry

### Requirement: Save units and timezone
The Units & locale screen SHALL save edits via Bearer `PATCH /api/profile` (`profile:write`) using the web enum values: distance `Kilometers`|`Miles`, weight `Kilograms`|`Pounds`, temperature `Celsius`|`Fahrenheit`, and an IANA timezone string.

#### Scenario: Successful save
- **WHEN** the user changes one or more unit/timezone fields and saves successfully
- **THEN** the client persists the change and confirms success

#### Scenario: Save error
- **WHEN** the save request fails
- **THEN** the user sees an error and retained form values for correction

### Requirement: Refresh dependent displays after unit change
After a successful units save, the app SHALL invalidate or refetch cached data that formats distance, weight, or temperature so subsequent screens reflect the new units without requiring reinstall or re-login.

#### Scenario: Activity distance uses new unit
- **WHEN** the user switches distance units and later opens an activity that shows distance
- **THEN** distance is formatted with the newly saved unit preference

