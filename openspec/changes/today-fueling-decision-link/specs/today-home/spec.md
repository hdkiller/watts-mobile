## ADDED Requirements

### Requirement: Fuel-state decision link on Today
When nutrition tracking is enabled and today’s fuel state is known (Eco / Steady / Performance or current fuel-state vocabulary from the nutrition day / fueling plan), the Today decision composition SHALL show a compact fuel-state affordance near the recommendation or planned-only hero (one line or chip). The affordance MUST NOT introduce calorie/macro tiles, progress bars, or a nutrition dashboard into the first-viewport decision band. Tapping the affordance SHALL navigate to Log nutrition (or open the shared nutrition target-explain sheet when that capability is already available) without duplicating a second nutrition design system.

#### Scenario: Fuel state present with recommendation
- **WHEN** today’s recommendation is shown and nutrition tracking is on with a known fuel state
- **THEN** Today shows a compact fuel-state label in the decision composition above primary CTAs

#### Scenario: Fuel state with planned-only hero
- **WHEN** Today shows a planned-only hero and nutrition tracking is on with a known fuel state
- **THEN** the compact fuel-state affordance still appears in the decision composition

#### Scenario: Tracking off or unknown fuel state
- **WHEN** nutrition tracking is disabled or today’s fuel state is unavailable
- **THEN** Today omits the fuel-state decision affordance without empty chrome

#### Scenario: Tap opens nutrition path
- **WHEN** the user taps the fuel-state decision affordance
- **THEN** the app opens Log nutrition or the shared nutrition explain sheet (not a new Today-only nutrition editor)

### Requirement: Full nutrition glance below decision CTAs
When nutrition tracking is enabled, the full Today nutrition glance (calories, macros, next window when shown) SHALL appear below primary decision CTAs (Accept / Rest / planned primary actions), with other context glances. The full nutrition glance MUST NOT render above the recommendation or planned-only hero.

#### Scenario: Glance placement
- **WHEN** Today renders with a recommendation and nutrition tracking enabled
- **THEN** the full Nutrition glance appears after primary decision CTAs, not above the hero

#### Scenario: Finish setup
- **WHEN** Today is showing the incomplete-activation Finish setup surface
- **THEN** the full nutrition glance and fuel-state decision link are omitted per existing activation empty-path rules
