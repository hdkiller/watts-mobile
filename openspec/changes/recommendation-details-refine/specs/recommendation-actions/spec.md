## ADDED Requirements

### Requirement: Refine regenerates; Accept decides
Refine or Refresh SHALL regenerate or refresh today’s recommendation via the generate path and MUST NOT mark the recommendation accepted. Accept (hero or detail sheet) remains the only action that applies suggested modifications.

#### Scenario: After refine completes
- **WHEN** a refined recommendation loads successfully
- **THEN** Accept remains available per existing recommendation-actions rules when modifications are pending

### Requirement: Detail Accept shares accept mutation
Accept Changes in the recommendation detail sheet SHALL call the same `POST /api/recommendations/{id}/accept` path as the Today hero Accept action.

#### Scenario: Same accept endpoint
- **WHEN** the user accepts from the detail sheet
- **THEN** the client uses the shared accept mutation and refreshes Today on success
