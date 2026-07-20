## MODIFIED Requirements

### Requirement: Show pending tool approvals
When the active room has pending tool approvals (including those delivered via WebSocket or message metadata), the Coach UI SHALL present approve/deny controls for each pending approval. The approval title SHALL use a humanized tool name (title case, spaces instead of underscores). When common argument fields are present (`title`, `name`, or `date`), the UI SHALL show a single short preview line under the title.

#### Scenario: Approval requested
- **WHEN** a coach turn requests tool approval
- **THEN** the user sees a humanized tool name and can approve or deny

#### Scenario: Approval with arg preview
- **WHEN** a pending approval includes an argument such as `title`, `name`, or `date`
- **THEN** the approval card shows one short preview line derived from that argument

#### Scenario: Approval submitted
- **WHEN** the user approves or denies a pending tool
- **THEN** the client submits the decision to the server and the pending control clears or updates

## ADDED Requirements

### Requirement: Surface companion-curated tool outcomes
When companion-curated tools complete successfully in the active room, the Coach UI SHALL show a short in-thread confirmation with domain-specific wording (not only a humanized tool name). Curated coverage MUST include nutrition writes and reads (`log_nutrition_meal`, `log_hydration_intake`, `patch_nutrition_items`, `delete_nutrition_item`, `delete_hydration`, `get_nutrition_log`, `get_daily_fueling_status`), wellness/recovery tools already supported, recommendation tools (`recommend_workout`, `get_recommendation_details`, `list_pending_recommendations`), planned-workout lite tools (`create_planned_workout`, `update_planned_workout`, `reschedule_planned_workout`, `get_planned_workouts`, `get_planned_workout_details`), and activity read tools (`get_recent_workouts`, `search_workouts`, `get_workout_details`). Tools outside this set MUST still show a compact generic success, failure, or denied outcome.

#### Scenario: Recommendation tool succeeds
- **WHEN** `recommend_workout` (or another curated recommendation tool) completes successfully
- **THEN** the user sees a compact curated confirmation in the Coach thread

#### Scenario: Planned workout tool succeeds
- **WHEN** `create_planned_workout` or `reschedule_planned_workout` completes successfully
- **THEN** the user sees a compact curated confirmation in the Coach thread

#### Scenario: Activity read tool succeeds
- **WHEN** `get_recent_workouts` or `get_workout_details` completes successfully
- **THEN** the user sees a compact curated confirmation in the Coach thread

#### Scenario: Nutrition read tool succeeds
- **WHEN** `get_nutrition_log` or `get_daily_fueling_status` completes successfully
- **THEN** the user sees a compact curated confirmation in the Coach thread

#### Scenario: Non-curated tool still surfaces
- **WHEN** a non-curated tool such as `perform_calculation` completes successfully
- **THEN** the user still sees a compact generic outcome card with a humanized tool label

### Requirement: Show in-progress tool activity
While a coach turn has non-terminal tool parts (for example `call`, `input-streaming`, `input-available`, or `partial-call`), the Coach UI SHALL show a compact in-progress indicator per distinct tool call. When a tool reaches a terminal state, the in-progress indicator for that tool call MUST be replaced by the terminal outcome card (not shown alongside it).

#### Scenario: Tool running during turn
- **WHEN** the assistant message includes a non-terminal tool part for `create_planned_workout`
- **THEN** the user sees an in-progress chip indicating that tool is running

#### Scenario: In-progress clears on completion
- **WHEN** the same tool call later reaches `output-available` (or error/denied)
- **THEN** the in-progress chip for that tool call is no longer shown and the terminal outcome card is shown instead

### Requirement: Domain visual buckets on tool feedback
In-progress chips and terminal tool outcome cards SHALL use a small set of domain visual buckets (`nutrition`, `wellness`, `planning`, `workouts`, `other`) to choose tint and icon. Recommendation and planned-workout tools map to `planning`. Tools without a named bucket map to `other` and MUST remain visually quieter than named buckets. Domain chrome MUST NOT require rich payload stats, charts, or expandable raw JSON.

#### Scenario: Nutrition outcome uses nutrition chrome
- **WHEN** a nutrition curated tool completes
- **THEN** its outcome card uses the nutrition domain tint/icon

#### Scenario: Unknown tool uses other chrome
- **WHEN** a non-bucketed tool completes
- **THEN** its outcome card uses the `other` domain presentation
