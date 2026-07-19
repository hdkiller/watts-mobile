## ADDED Requirements

### Requirement: Active recovery context on Today
The Today tab SHALL show compact read-oriented chips for recovery-context items active today (when any exist), placed with the recovery strip and below the recommendation/planned blocks.

#### Scenario: Active chips visible
- **WHEN** one or more recovery-context items are active for the local today
- **THEN** Today shows compact chips for those items that open the item detail/edit flow when tapped

### Requirement: Quiet Log recovery event affordance on Today
The Today tab SHALL offer a secondary text affordance (“Log recovery event” or equivalent) that opens the recovery-event create flow. It MUST NOT use a primary button style and MUST appear below the primary recommendation CTAs when those CTAs are shown.

#### Scenario: Open recovery event from Today
- **WHEN** the user taps Log recovery event on Today
- **THEN** the app navigates to the recovery-event create flow

#### Scenario: Primary CTAs remain primary
- **WHEN** Today renders with a recommendation
- **THEN** Accept (and later Modify / Rest) remain the primary decision actions above the Log recovery event control
