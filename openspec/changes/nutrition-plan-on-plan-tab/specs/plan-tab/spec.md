## REMOVED Requirements

### Requirement: Nutrition segment placeholder until plan change
**Reason**: Replaced by full nutrition-plan surface on Plan → Nutrition.
**Migration**: Use `nutrition-plan` weekly plan / generate / meal / grocery requirements.

## ADDED Requirements

### Requirement: Nutrition segment hosts nutrition plan
Plan → Nutrition SHALL host the `nutrition-plan` weekly planning surface (not a permanent placeholder) when the nutrition-plan capability is implemented.

#### Scenario: Nutrition segment is planning board
- **WHEN** the athlete opens Plan → Nutrition after this change
- **THEN** they see the weekly nutrition plan UI (or tracking-off honesty), not a “coming soon” placeholder
