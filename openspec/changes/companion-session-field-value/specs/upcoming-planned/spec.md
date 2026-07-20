## ADDED Requirements

### Requirement: Compliance actions on planned detail
The planned workout detail screen SHALL expose Complete and Skip capabilities defined by `planned-compliance`, without removing existing structure summary, coach cues, zones, or Open web escape requirements.

#### Scenario: Actions visible when actionable
- **WHEN** the user opens a planned workout that is not in a terminal completed/skipped state
- **THEN** they can reach Complete (and Skip when the skip contract is available) from that detail screen

### Requirement: Coach and fueling entry points on planned detail
Planned detail SHALL host Discuss with Coach per `session-coach-handoff` and fueling prep glance per `planned-fueling-prep` when those capabilities apply, alongside the existing Open web escape for plan-architect depth.

#### Scenario: Companion actions coexist with Open web
- **WHEN** the user views planned detail
- **THEN** in-app companion actions do not replace the Open web escape for deeper planned-workout tools

### Requirement: Navigate to linked completed activity
When planned workout detail includes a server-provided linked completed workout id, the screen SHALL offer navigation to that activity’s in-app summary. The system MUST NOT invent a link from date/type heuristics on this screen.

#### Scenario: Linked activity present
- **WHEN** the planned detail payload includes a completed workout id
- **THEN** the user can open that activity summary in-app

#### Scenario: Linked activity absent
- **WHEN** no completed workout id is provided
- **THEN** the planned detail does not show a fabricated completed-activity link
