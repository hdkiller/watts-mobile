## ADDED Requirements

### Requirement: Time paging and optional Nutrition mode
The Athlete activity glance SHALL support horizontal twelve-week page swipes as specified by `athlete-glance-swipe-nutrition`. When nutrition tracking is enabled, the glance SHALL include a Nutrition mode segment sharing the same page window.

#### Scenario: Live page still shows planned future
- **WHEN** the athlete views the live Activity page
- **THEN** upcoming planned days in the forward portion of the window still show soft outlines

#### Scenario: Older activity page
- **WHEN** the athlete pages to an older Activity block entirely in the past
- **THEN** day circles reflect completed workouts only (no future planned outlines in that past window)
