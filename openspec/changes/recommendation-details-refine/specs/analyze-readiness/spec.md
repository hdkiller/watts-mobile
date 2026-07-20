## ADDED Requirements

### Requirement: Shared in-flight generation lock
While Analyze Readiness or Refine or Refresh generation is in flight, Today SHALL treat generation as a single shared busy state so the user cannot start a second generate/refine job from another CTA.

#### Scenario: Refine blocked while analyzing
- **WHEN** Analyze Readiness is generating
- **THEN** Refine submit is disabled or ignored until the job finishes or times out

#### Scenario: Analyze blocked while refining
- **WHEN** Refine or Refresh is generating
- **THEN** Analyze Readiness is not startable until the job finishes or times out
