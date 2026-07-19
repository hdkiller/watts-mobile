# coach-chat-tool-feedback Specification

## Purpose
TBD - created by archiving change coach-chat-sessions-and-media. Update Purpose after archive.
## Requirements
### Requirement: Show pending tool approvals
When the active room has pending tool approvals (including those delivered via WebSocket or message metadata), the Coach UI SHALL present approve/deny controls for each pending approval.

#### Scenario: Approval requested
- **WHEN** a coach turn requests tool approval
- **THEN** the user sees the tool name/summary and can approve or deny

#### Scenario: Approval submitted
- **WHEN** the user approves or denies a pending tool
- **THEN** the client submits the decision to the server and the pending control clears or updates

### Requirement: Surface nutrition tool outcomes
When nutrition-related tools complete successfully in the active room, the Coach UI SHALL show a short in-thread summary that food or hydration was logged (or updated), without requiring the athlete to open Log.

#### Scenario: Meal logged from chat
- **WHEN** `log_nutrition_meal` (or equivalent nutrition log tool) completes successfully
- **THEN** the user sees a compact confirmation in the Coach thread

### Requirement: Keep Log as structured fallback
Tool feedback in Coach MUST NOT replace the Log nutrition quick-log form; both paths remain available.

#### Scenario: Still use Log form
- **WHEN** the user prefers manual macros
- **THEN** they can still quick-log from the Log tab nutrition section

