# athlete-profile-overview Specification

## Purpose
TBD - created by archiving change athlete-profile-overview. Update Purpose after archive.
## Requirements
### Requirement: Athlete identity header
The Athlete profile overview SHALL show the athlete’s display name, age when date of birth or age is available, and country as a flag or country code when country is available. Missing optional fields MUST be omitted rather than fabricated.

#### Scenario: Identity present
- **WHEN** profile data includes name and age (or dob) and country
- **THEN** the Athlete overview shows name, age, and country/flag

#### Scenario: Partial identity
- **WHEN** country or age is missing
- **THEN** the overview still shows the available identity fields and omits the missing ones

### Requirement: HR threshold readouts
The Athlete profile overview SHALL show Max HR, Resting HR, and LTHR when each value is present, with bpm units. Null values MUST be omitted or shown as an honest empty affordance without inventing estimates unless the API explicitly provides an estimated Max HR distinct from measured Max HR.

#### Scenario: Thresholds present
- **WHEN** max HR, resting HR, and LTHR are available
- **THEN** the overview shows all three with bpm units

#### Scenario: Missing threshold
- **WHEN** LTHR is null
- **THEN** the overview does not invent an LTHR value

### Requirement: AI Athlete Profile summary
When a latest `ATHLETE_PROFILE` report is available via Bearer API, the overview SHALL show the executive summary text and SHALL show athlete score chips when score fields are present. When no report exists, the overview SHALL show an honest empty state with Sync (when generate is available) and Open web rather than placeholder AI copy.

#### Scenario: Report completed
- **WHEN** the latest athlete profile report status is COMPLETED and includes an executive summary
- **THEN** the overview displays that summary (and score chips when present)

#### Scenario: No report
- **WHEN** no athlete profile report is available
- **THEN** the overview shows an empty state without fabricated narrative text

#### Scenario: Reports API forbidden
- **WHEN** Bearer reports access returns 401 or 403
- **THEN** the overview explains that permissions need refresh, offers **Sign out and sign in again**, and offers Open web to `/profile/athlete` — and MUST NOT imply the AI report is permanently web-only for all accounts

### Requirement: Sync regenerate
When Bearer `POST /api/profile/generate` is available, the overview SHALL offer Sync to regenerate the AI athlete profile. While generation is in progress the UI SHALL show a generating state and SHALL poll for report completion. On quota exceeded (429) the UI SHALL show an honest quota message. When generate is not Bearer-available, Sync MUST be hidden or replaced with Open web — not a dead control.

#### Scenario: Sync starts
- **WHEN** the athlete chooses Sync and the generate request is accepted
- **THEN** the UI enters a generating state and refreshes when the latest report completes or fails

#### Scenario: Quota exceeded
- **WHEN** generate returns 429
- **THEN** the athlete sees a quota message and can Open web

#### Scenario: Generate not available to companion
- **WHEN** companion cannot call generate with Bearer auth
- **THEN** Sync is not presented as a working in-app action (Open web is offered instead)

### Requirement: Open web full athlete profile
The overview SHALL offer Open web that opens the instance `/profile/athlete` (or equivalent Athlete Profile report path) in the system browser via the shared session handoff helper when available for the full AI report and web-only tools.

#### Scenario: Open web report
- **WHEN** the athlete chooses Open full report on web from the Athlete profile overview
- **THEN** the system browser opens the instance Athlete Profile report surface (handoff when mint succeeds)

### Requirement: Lite in-app report sheet
When a COMPLETED latest report is available, the overview SHALL offer a lite in-app report sheet for sections already present on the report payload. Full history picker, share, and regenerate chrome MUST remain Open web.

#### Scenario: View lite report
- **WHEN** the athlete chooses View report (or taps the summary) and a COMPLETED report is loaded
- **THEN** a sheet shows available report sections without claiming full web parity

