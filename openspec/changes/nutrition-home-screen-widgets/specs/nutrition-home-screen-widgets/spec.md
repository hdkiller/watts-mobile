## ADDED Requirements

### Requirement: Nutrition widget catalog
The iOS widget extension SHALL offer four distinct nutrition widgets named Nutrition Today, Hydration, Next Fuel, and Photo Food Log alongside the existing Today’s session widget. Nutrition Today SHALL support `systemSmall` and `systemMedium`, Hydration and Photo Food Log SHALL support `systemSmall`, and Next Fuel SHALL support `systemMedium`.

#### Scenario: Widget gallery
- **WHEN** an athlete with a compatible iOS binary opens the Coach Watts widget gallery
- **THEN** the gallery lists the four nutrition widgets with descriptions that distinguish daily progress, hydration, next-fueling, and camera-first food logging

#### Scenario: Existing widget remains available
- **WHEN** the new widget definitions are installed
- **THEN** Today’s session remains a separate available widget with its existing supported families

### Requirement: Nutrition Today glance
Nutrition Today SHALL show the current local day’s nutrition progress from the latest trusted snapshot. The small family SHALL prioritize calories actual versus goal or calories logged when no goal exists. The medium family SHALL additionally show compact carbs, protein, fat, hydration, and fuel-state values when those values are available.

#### Scenario: Daily targets available
- **WHEN** the current snapshot contains calories and macro targets
- **THEN** Nutrition Today shows actual-versus-target progress without displaying negative remaining values or unclamped progress graphics

#### Scenario: Targets unavailable
- **WHEN** the current snapshot contains actual intake but no daily targets
- **THEN** Nutrition Today shows the actual values and MUST NOT invent goals or render progress graphics with a fabricated denominator

#### Scenario: Fuel state available
- **WHEN** the current snapshot contains fuel state 1, 2, or 3
- **THEN** the medium widget labels it Eco, Steady, or Performance respectively

### Requirement: Hydration glance and action
Hydration SHALL show water logged for the current local day and progress against `fluidGoalMl` when that target exists. Its primary action SHALL open the app’s hydration quick-add flow; the extension MUST NOT submit an authenticated hydration write itself.

#### Scenario: Hydration target available
- **WHEN** the snapshot contains water actual and a positive fluid target
- **THEN** Hydration shows actual versus target in a consistent unit and clamped visual progress

#### Scenario: Hydration target unavailable
- **WHEN** water has been logged but no fluid target is available
- **THEN** Hydration shows the logged volume without inventing a target

#### Scenario: Add water
- **WHEN** the athlete activates Add water from the widget
- **THEN** Coach Watts opens to the existing hydration quick-add sheet and no write occurs until the athlete confirms in the app

### Requirement: Next Fuel decision glance
Next Fuel SHALL show the next future fueling window supplied by the existing nutrition API, including window label, start time, carb target, protein target, and workout title when present. It SHALL fall back to a useful daily-fuel state when no future window is available.

#### Scenario: Future fueling window available
- **WHEN** the latest snapshot contains a future fueling window
- **THEN** Next Fuel shows its timing and available carb/protein targets with workout context when present

#### Scenario: No future window
- **WHEN** the latest snapshot has no future fueling window
- **THEN** Next Fuel shows a Daily fuel fallback using available day progress and offers the meal-log handoff rather than showing a broken or blank widget

#### Scenario: Fueling window passes before refresh
- **WHEN** the stored fueling-window time is in the past at render time
- **THEN** Next Fuel MUST NOT describe it as upcoming and SHALL use the daily-fuel fallback

### Requirement: Photo Food Log action
Photo Food Log SHALL provide a camera-first handoff for meal logging. The widget extension MUST NOT access the camera, upload a photo, call the estimate API, or save nutrition itself; those operations SHALL occur in the foreground app through the existing photo estimate review flow.

#### Scenario: Authenticated camera-first launch
- **WHEN** an authenticated athlete with nutrition tracking enabled taps Photo Food Log
- **THEN** Coach Watts opens the Log Meal sheet and launches system camera capture without requiring an intermediate Log or Take photo tap

#### Scenario: Captured photo
- **WHEN** the athlete captures a photo from the widget handoff
- **THEN** the app analyzes it and presents the existing editable estimate review before any nutrition write

#### Scenario: Camera cancelled
- **WHEN** the athlete cancels system camera capture
- **THEN** the app leaves the Log Meal sheet open in a usable compose state and MUST NOT upload or save anything

#### Scenario: Camera permission denied
- **WHEN** camera permission is denied or unavailable
- **THEN** the app shows permission recovery guidance and retains manual/photo-library logging alternatives without attempting a nutrition write

#### Scenario: Tracking disabled
- **WHEN** the athlete taps Photo Food Log while nutrition tracking is disabled
- **THEN** the app shows the normal tracking-disabled state and MUST NOT request camera permission

### Requirement: Widget snapshot lifecycle
The app SHALL update all nutrition widget snapshots from normalized app-side nutrition data after successful nutrition reads, after successful meal or hydration writes and total refresh, and when usable cached nutrition data is available on foreground. The widget extension MUST NOT store OAuth credentials or fetch authenticated nutrition APIs directly.

#### Scenario: Nutrition read succeeds
- **WHEN** the app receives today’s nutrition data while tracking is enabled
- **THEN** it maps and pushes a versioned snapshot to each nutrition widget

#### Scenario: Nutrition write succeeds
- **WHEN** a meal or hydration save succeeds and refreshed totals are available
- **THEN** the widget snapshots update to the refreshed values

#### Scenario: API read fails
- **WHEN** an app-side nutrition refresh fails
- **THEN** the app does not replace a valid prior snapshot with fabricated zero values

### Requirement: Honest empty, disabled, signed-out, and stale states
Every data-bearing nutrition widget SHALL render an explicit non-data state when nutrition is empty, tracking is disabled, the user is signed out, or the snapshot is stale. Photo Food Log SHALL reflect signed-out and tracking-disabled eligibility but does not require empty or stale progress states. Empty and stale states MUST NOT imply that missing data is live or that a target has been completed.

#### Scenario: Empty current day
- **WHEN** a current-day snapshot is valid but contains no logged nutrition or hydration
- **THEN** the widget presents a first-log invitation and does not present zero as goal completion

#### Scenario: Tracking disabled
- **WHEN** nutrition tracking is disabled
- **THEN** all nutrition widgets replace nutrition values with a tracking-off state

#### Scenario: Snapshot stale
- **WHEN** the snapshot is from a prior local day or older than the configured freshness threshold
- **THEN** the widget identifies the last update/day and avoids current-tense urgency or “remaining today” language

#### Scenario: Signed out
- **WHEN** no authenticated account is active
- **THEN** each nutrition widget shows an Open Coach Watts state and contains no prior athlete values

### Requirement: Widget privacy across identity boundaries
Nutrition widget snapshots SHALL contain only day totals, targets, normalized progress, coarse fuel state, next-window targets/timing, and snapshot metadata. The app SHALL clear snapshot values on sign-out, account switch, instance switch, or nutrition-tracking disable.

#### Scenario: User signs out
- **WHEN** sign-out begins
- **THEN** the app overwrites every nutrition widget with cleared-state props before completing local auth and query-cache teardown

#### Scenario: Account or instance changes
- **WHEN** the active athlete account or self-hosted instance changes
- **THEN** values from the prior identity are cleared and MUST NOT remain visible while the new identity loads

#### Scenario: Snapshot content inspected
- **WHEN** the serialized widget props are inspected
- **THEN** they contain no OAuth token, account identifier, email, instance URL, meal name, photo, or free-text note

### Requirement: Adaptive and accessible widget presentation
The nutrition widgets SHALL maintain readable hierarchy in light, dark, and iOS tinted rendering modes and SHALL expose meaningful accessibility labels for primary values and actions.

#### Scenario: Appearance changes
- **WHEN** iOS renders a nutrition widget in light, dark, or tinted mode
- **THEN** text and progress indicators remain distinguishable without relying on hue alone

#### Scenario: Assistive technology reads the widget
- **WHEN** VoiceOver focuses a widget value or action
- **THEN** it announces the metric, actual value, target when available, and action purpose rather than isolated numbers
