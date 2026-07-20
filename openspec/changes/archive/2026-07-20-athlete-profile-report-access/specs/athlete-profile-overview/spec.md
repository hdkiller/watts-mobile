## MODIFIED Requirements

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

### Requirement: Open web full athlete profile
The overview SHALL offer Open web that opens the instance `/profile/athlete` (or equivalent Athlete Profile report path) in the system browser via the shared session handoff helper when available for the full AI report and web-only tools.

#### Scenario: Open web report
- **WHEN** the athlete chooses Open full report on web from the Athlete profile overview
- **THEN** the system browser opens the instance Athlete Profile report surface (handoff when mint succeeds)

## ADDED Requirements

### Requirement: Lite in-app report sheet
When a COMPLETED latest report is available, the overview SHALL offer a lite in-app report sheet for sections already present on the report payload. Full history picker, share, and regenerate chrome MUST remain Open web.

#### Scenario: View lite report
- **WHEN** the athlete chooses View report (or taps the summary) and a COMPLETED report is loaded
- **THEN** a sheet shows available report sections without claiming full web parity
