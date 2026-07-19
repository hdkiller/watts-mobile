## MODIFIED Requirements

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

## ADDED Requirements

### Requirement: Surface recovery and wellness tool outcomes
When recovery-context or wellness-related tools complete successfully, the Coach UI SHALL show a short in-thread confirmation (e.g. recovery event logged, check-in saved) without requiring the athlete to open Log.

#### Scenario: Recovery tool success
- **WHEN** a recovery/journey tool completes successfully
- **THEN** the user sees a compact confirmation in the Coach thread

#### Scenario: Wellness tool success
- **WHEN** a wellness/check-in tool completes successfully
- **THEN** the user sees a compact confirmation in the Coach thread

### Requirement: Generic tool outcome fallback
For other completed tools that are not in a curated copy map, the Coach UI SHALL show a compact generic success or failure card using the tool name (humanized), rather than hiding the outcome entirely.

#### Scenario: Unknown tool success
- **WHEN** an unrecognized tool completes successfully
- **THEN** the user sees a short generic “Coach updated {tool}” (or equivalent) confirmation

### Requirement: Failed and denied tool states
When a tool fails or the athlete denies approval, the Coach UI SHALL show honest failure/denied copy in-thread so the athlete can retry in chat or use Log.

#### Scenario: Tool failure
- **WHEN** a tool part reports a failed/error state
- **THEN** the user sees a short failure message and is not left with a silent missing outcome

#### Scenario: Approval denied
- **WHEN** the user denies a pending tool approval
- **THEN** the pending control clears and the thread reflects that the action was not applied
