## ADDED Requirements

### Requirement: Expanded present-only summary metrics
In addition to distance, average power, normalized power, average HR, elevation, and intensity, the lite activity summary screen SHALL show additional present-only metrics when `GET /api/workouts/:id?includeStreams=false` includes them, including cadence, calories, max heart rate, max power, variability index (VI), and efficiency factor (EF) when each value is present and finite. The system MUST omit absent metrics and MUST NOT invent zeros. Streams MUST remain unloaded for this section.

#### Scenario: Extended metrics present
- **WHEN** the workout payload includes one or more of cadence, calories, max HR, max power, VI, or EF
- **THEN** the summary screen shows those present metrics in the compact labeled metrics layout

#### Scenario: Extended metrics absent
- **WHEN** none of the extended metric fields are present
- **THEN** the summary screen continues to show only the previously available metrics (or omits the section if none)

### Requirement: Completed strength exercises on activity detail
When the workout detail includes a non-empty `exercises` array, the activity summary screen SHALL show a compact Exercises section listing exercise names with prescription summaries when present (sets, reps, load, RPE). The system MUST NOT invent exercises or values when fields are absent.

#### Scenario: Exercises present
- **WHEN** the workout payload includes one or more exercises
- **THEN** the activity detail shows a compact exercise list

#### Scenario: Exercises absent
- **WHEN** the workout has no exercises array or an empty array
- **THEN** the activity detail does not show an Exercises section

### Requirement: Linked planned navigation from activity
When the workout detail includes a server-provided `plannedWorkoutId` (directly or via plan adherence), the activity summary SHALL offer navigation to that planned workout’s in-app detail.

#### Scenario: Open linked plan
- **WHEN** a planned workout id is present and the user chooses to view the plan
- **THEN** the app navigates to the in-app planned detail for that id

### Requirement: Adherence and Coach on activity summary
The activity summary screen SHALL host the plan-adherence glance per `activity-plan-adherence` and Discuss with Coach per `session-coach-handoff`, without removing AI analysis, charts, lite map, or Open web escape requirements.

#### Scenario: Companion debrief actions available
- **WHEN** the user views activity summary
- **THEN** they can access adherence (when present) and Discuss with Coach without losing Open web for explorer depth
