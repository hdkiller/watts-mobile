## ADDED Requirements

### Requirement: Display cached AI analysis
The activity detail screen SHALL display athlete-facing AI analysis when `GET /api/workouts/:id` includes analysis content (`aiAnalysisJson` and/or `aiAnalysis`) or performance scores, without requiring a separate analysis GET.

Displayed content SHALL include, when present: overall and dimension scores, executive summary, compact analysis sections, recommendations, and strengths/weaknesses. The system MUST NOT invent analysis text when the server did not supply it.

#### Scenario: Completed analysis with structured JSON
- **WHEN** `aiAnalysisStatus` is completed and `aiAnalysisJson` includes an executive summary
- **THEN** the activity detail screen shows the executive summary and available scores

#### Scenario: Markdown fallback
- **WHEN** structured JSON is absent but `aiAnalysis` markdown is present
- **THEN** the screen shows the markdown analysis text as a fallback

#### Scenario: No analysis content
- **WHEN** the workout has no analysis body and no scores
- **THEN** the screen does not show fabricated analysis copy

### Requirement: Honest analysis status
The activity detail screen SHALL reflect `aiAnalysisStatus` honestly (including analyzing, failed, not started, and quota exceeded when provided).

#### Scenario: Analyzing
- **WHEN** status is pending or processing
- **THEN** the user sees an analyzing state and the app continues to refresh the detail until a terminal status arrives or the screen is left

#### Scenario: Failed or quota
- **WHEN** status indicates failure or quota exceeded
- **THEN** the user sees an honest message and can use Open web or retry analyze when permitted

### Requirement: Analyze and regenerate
The activity detail screen SHALL allow the athlete to start or regenerate analysis via `POST /api/workouts/:id/analyze` when the Bearer token includes `workout:write`.

#### Scenario: Start analysis
- **WHEN** the user chooses Analyze on a workout without completed analysis
- **THEN** the app posts to the analyze endpoint and shows analyzing progress after a successful start

#### Scenario: Regenerate analysis
- **WHEN** the user chooses Regenerate on a workout with completed analysis
- **THEN** the app posts to the same analyze endpoint and refreshes until new results arrive

#### Scenario: Missing write scope
- **WHEN** analyze fails due to missing `workout:write`
- **THEN** the app explains that re-sign-in is required (or offers Open web) rather than silently failing
