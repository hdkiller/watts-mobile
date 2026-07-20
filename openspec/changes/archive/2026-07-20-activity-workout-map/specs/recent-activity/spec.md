## MODIFIED Requirements

### Requirement: Web escape for deep analysis
The summary screen SHALL offer Open web (or equivalent) for map explorer depth, GPX, interval audit, and other analysis surfaces not implemented in-app, rather than porting those explorer surfaces. AI analysis write-up and scores are in-app per `activity-ai-analysis`. Stream/zone/power-curve charts are in-app per `activity-charts`. The lite interactive route map is in-app per `activity-workout-map`.

#### Scenario: Open web from summary
- **WHEN** the user chooses Open web from activity summary
- **THEN** the system browser opens the instance URL for that workout or the instance home if a specific URL is unavailable

#### Scenario: Route map does not require Open web
- **WHEN** the workout has GPS coordinates and the athlete views activity summary
- **THEN** they can see the lite in-app route map without using Open web solely for the route
