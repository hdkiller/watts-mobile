## ADDED Requirements

### Requirement: Strategy segment on Plan → Nutrition
When nutrition tracking is enabled, Plan → Nutrition SHALL offer a Strategy view alongside the existing weekly plan view. When tracking is disabled, the Strategy view SHALL show the same honest Settings → Nutrition path as the plan view rather than empty charts.

#### Scenario: Athlete opens Strategy
- **WHEN** the athlete selects Strategy inside Plan → Nutrition and tracking is enabled
- **THEN** they see fuel state, hydration standing, the active fueling feed, and the energy horizon

#### Scenario: Tracking disabled
- **WHEN** nutrition tracking is off
- **THEN** the Strategy view shows honest copy and a path to Settings → Nutrition

### Requirement: Fuel state and hydration standing
The Strategy view SHALL read `GET /api/nutrition/strategy` (or documented successor) and present the current fuel state with a plain-language explanation, the hydration debt, the hydration status, and the server's hydration advice copy.

#### Scenario: Fuel state explained
- **WHEN** the athlete taps the fuel state
- **THEN** they see what that state means for their targets, not only its label

#### Scenario: Advice is the server's
- **WHEN** hydration advice is displayed
- **THEN** it reflects the server's advice for the current debt and MUST NOT be invented on device

### Requirement: Hydration reset
When the strategy payload sets a hydration flush prompt, the athlete SHALL be able to reset hydration debt via Bearer `POST /api/nutrition/hydration-reset` (or documented successor). The reset control MUST NOT be offered when the server has not prompted for it.

#### Scenario: Reset offered and used
- **WHEN** the server sets the flush prompt and the athlete confirms the reset, and the API succeeds
- **THEN** the hydration standing refreshes to reflect the reset

#### Scenario: No prompt, no control
- **WHEN** the server has not set a flush prompt
- **THEN** no hydration reset control is shown

### Requirement: Active fueling feed
The Strategy view SHALL read `GET /api/nutrition/active-feed` (or documented successor) and show what the athlete should fuel with now in the context of the current or imminent session. When the feed is empty, honest empty copy SHALL be shown rather than fabricated items.

#### Scenario: Feed has entries
- **WHEN** the active feed returns fueling entries
- **THEN** the athlete sees them in the Strategy view

#### Scenario: Feed empty
- **WHEN** the active feed is empty
- **THEN** the athlete sees empty copy and no invented recommendations

### Requirement: Multi-day energy horizon
The Strategy view SHALL read `GET /api/nutrition/extended-wave` (or documented successor) and render a multi-day energy horizon sized for a phone screen. The chart MUST remain legible at phone width; where a faithful reading is not achievable on device, the view SHALL offer the web escape rather than render a misleading chart.

#### Scenario: Horizon renders
- **WHEN** wave data is available for the horizon range
- **THEN** the athlete sees a legible multi-day energy horizon

#### Scenario: Horizon not representable
- **WHEN** the horizon cannot be rendered legibly on device
- **THEN** the athlete is offered the web view instead of a cramped or misleading chart

### Requirement: Independent degradation
The Strategy view's reads SHALL degrade independently. A failure in one read MUST NOT blank the whole view; each block SHALL surface its own honest error and the remaining blocks SHALL still render.

#### Scenario: One read fails
- **WHEN** the energy horizon request fails but strategy and active feed succeed
- **THEN** fuel state and the fueling feed still render, and only the horizon block shows an error

### Requirement: Today remains the decision surface
The Strategy view SHALL explain fueling state and MUST NOT duplicate Today's next-window decision glance.

#### Scenario: No duplicated glance
- **WHEN** the athlete uses both Today and Strategy
- **THEN** Today shows the next fueling decision and Strategy explains the standing behind it
