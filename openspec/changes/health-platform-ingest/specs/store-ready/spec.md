## MODIFIED Requirements

### Requirement: Privacy and health data strings
The repository SHALL contain store-ready privacy/health usage strings (or a checklist of exact copy) covering OAuth identity, wellness check-in, **optional Health Sync upload of Apple Health / Health Connect metrics and workouts to the athlete’s Coach Watts instance when enabled**, notification data use, and **camera/photo library access for Coach chat attachments (including nutrition logging)**, without medical claims.

#### Scenario: Store questionnaire copy available
- **WHEN** preparing App Store / Play Console questionnaires
- **THEN** engineers can find the approved privacy/health strings in-repo, including Health Sync upload purpose text (distinct from Log-only prefill) and photo/camera purpose text for Coach

## ADDED Requirements

### Requirement: Health Sync privacy disclosure in-app
When presenting Health Sync enablement, the app SHALL disclose that enabling sync uploads health metrics and workout sessions to the athlete’s Coach Watts instance, that sync is optional, and that Coach Watts does not write data back to Apple Health or Health Connect.

#### Scenario: Enable copy discloses upload
- **WHEN** the athlete views the Sync to Coach Watts control before or while enabling it
- **THEN** on-screen copy states that data is uploaded to their Coach Watts instance when sync is on
