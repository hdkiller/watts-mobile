## ADDED Requirements

### Requirement: Nutrition segment splits Strategy and Plan
Plan → Nutrition SHALL offer a Strategy view and a Plan view rather than being plan-only, mirroring the web nutrition surface. The weekly plan content SHALL remain reachable and unchanged as the Plan view.

#### Scenario: Both views reachable
- **WHEN** the athlete opens Plan → Nutrition
- **THEN** they can switch between Strategy and the weekly plan without leaving the tab

#### Scenario: Plan view unchanged
- **WHEN** the athlete opens the Plan view after this change
- **THEN** week navigation, draft generate, day sheet, and grocery behave as before
