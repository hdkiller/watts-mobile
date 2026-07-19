## MODIFIED Requirements

### Requirement: Lite activity summary
Tapping a workout SHALL open a summary stack screen with core fields (title, date, duration, load/TSS when present), optional lite summary metrics when present, and the AI analysis section when analysis data or status requires athlete attention. Deep charts/streams MAY still use Open web.

#### Scenario: Open summary
- **WHEN** the user taps a workout row
- **THEN** the app navigates to that workout’s summary screen

#### Scenario: Core fields still shown
- **WHEN** the summary screen loads successfully
- **THEN** the user sees title and available date/duration/load fields even if summary metrics or analysis are absent

#### Scenario: Analysis visible when ready
- **WHEN** the workout detail includes completed AI analysis content
- **THEN** the summary screen shows that analysis in-app rather than requiring Open web solely to read it

### Requirement: Web escape for deep analysis
The summary screen SHALL offer Open web (or equivalent) for charts, streams, maps, and other explorer depth rather than porting those surfaces. AI analysis write-up and scores are in-app per `activity-ai-analysis`.

#### Scenario: Open web from summary
- **WHEN** the user chooses Open web from activity summary
- **THEN** the system browser opens the instance URL for that workout or the instance home if a specific URL is unavailable
