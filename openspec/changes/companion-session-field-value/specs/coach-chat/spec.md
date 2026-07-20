## ADDED Requirements

### Requirement: Seed from session detail handoff
In addition to Today/recovery seed for empty rooms, the Coach surface SHALL accept session handoff context from planned or activity detail (`session-coach-handoff`) and include a short non-prescriptive session seed when starting or sending the first discuss turn from that handoff. The system MUST NOT invent prescriptions beyond server-provided session fields.

#### Scenario: Session handoff seeds discuss turn
- **WHEN** Coach is opened with session handoff parameters and the user sends the discuss prompt
- **THEN** the outbound message includes brief session context derived from that planned or completed workout

#### Scenario: Today seed still works
- **WHEN** Coach is opened from Today Discuss without session handoff
- **THEN** existing Today/recovery seeding behavior remains available for empty rooms
