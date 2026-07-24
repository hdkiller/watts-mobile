## ADDED Requirements

### Requirement: Horizontal time paging on Athlete glance
The Athlete glance SHALL allow horizontal swipe between successive twelve-week Monday-start pages. The live page (current training window including short planned future) SHALL be the newest page. Older pages SHALL shift backward by twelve weeks each. The glance MUST NOT allow paging newer than the live page.

#### Scenario: Swipe to older page
- **WHEN** the athlete swipes from the live page toward older history
- **THEN** the glance shows the previous twelve-week block and updates the range caption

#### Scenario: Cannot pass live page
- **WHEN** the athlete is on the live page and swipes toward the future
- **THEN** paging does not advance past the live window

### Requirement: Activity and Nutrition modes
When nutrition tracking is enabled, the glance SHALL offer an Activity | Nutrition control. Activity mode retains done/planned day circles. Nutrition mode SHALL show filled circles for days with logged intake (including hydration-only) and empty circles for gaps, with a today affordance. When tracking is disabled, the Nutrition control MUST be hidden and Activity mode remains.

#### Scenario: Nutrition mode shows gaps
- **WHEN** tracking is enabled and the athlete selects Nutrition
- **THEN** days without logged intake in the page window appear empty and logged days appear filled

#### Scenario: Tracking off
- **WHEN** nutrition tracking is disabled
- **THEN** only the Activity glance is shown (no Nutrition segment)

### Requirement: Nutrition header and navigation
Nutrition mode SHALL show counts that make gaps visible (logged days and/or gap days in the page window). Tapping a nutrition day SHALL navigate to the Log tab.

#### Scenario: Nutrition summary
- **WHEN** Nutrition mode has logged and unlogged past/today days in range
- **THEN** the header reflects logged and gap counts without streak or calorie intensity

#### Scenario: Nutrition day tap
- **WHEN** the athlete taps any day in Nutrition mode
- **THEN** the app opens the Log tab
