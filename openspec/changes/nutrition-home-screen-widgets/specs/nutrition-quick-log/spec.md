## ADDED Requirements

### Requirement: Nutrition widget handoff routes
The nutrition quick-log surface SHALL accept canonical widget handoffs for the nutrition summary, meal logger, camera-first photo estimate, and hydration quick-add. Handoffs SHALL use the existing authentication return-path behavior and MUST NOT bypass the normal tracking-enabled, estimate-review, and save-confirmation rules.

#### Scenario: Open nutrition summary
- **WHEN** the athlete taps Nutrition Today
- **THEN** the app opens Log with the nutrition summary visible

#### Scenario: Open meal logger
- **WHEN** the athlete taps the Next Fuel meal action
- **THEN** the app opens Log with the existing meal-log sheet visible and does not save an item until the athlete confirms

#### Scenario: Open hydration quick-add
- **WHEN** the athlete taps the Hydration action
- **THEN** the app opens Log with the existing hydration quick-add sheet visible and does not save water until the athlete confirms

#### Scenario: Open camera-first photo estimate
- **WHEN** an authenticated athlete taps Photo Food Log with nutrition tracking enabled
- **THEN** the app opens the existing Log Meal sheet, launches its camera path once, and proceeds through analyzing and editable review before Save meal

#### Scenario: Resume photo handoff after authentication
- **WHEN** Photo Food Log is tapped while logged out
- **THEN** the app preserves the pending nutrition destination through sign-in and opens the camera-first meal surface when safe, without saving or uploading before fresh user confirmation

#### Scenario: Widget opened while logged out
- **WHEN** a nutrition widget handoff opens Coach Watts without an authenticated session
- **THEN** the app completes its normal sign-in flow and then resumes the pending nutrition destination when safe

#### Scenario: Tracking disabled before handoff
- **WHEN** a widget handoff reaches Log after nutrition tracking has been disabled
- **THEN** the app shows the normal tracking-disabled state and MUST NOT attempt a nutrition write
