## MODIFIED Requirements

### Requirement: Privacy and health data strings
The repository SHALL contain store-ready privacy/health usage strings (or a checklist of exact copy) covering OAuth identity, wellness check-in, notification data use, and **camera/photo library access for Coach chat attachments (including nutrition logging)**, without medical claims.

#### Scenario: Store questionnaire copy available
- **WHEN** preparing App Store / Play Console questionnaires
- **THEN** engineers can find the approved privacy/health strings in-repo, including photo/camera purpose text for Coach

## ADDED Requirements

### Requirement: Photo permission purpose strings in app config
iOS/Android permission prompts for camera and photo library SHALL use Coach Watts purpose copy that states chat attachments / nutrition logging (not generic “access photos”).

#### Scenario: Permission dialog copy
- **WHEN** the OS shows a camera or photo-library permission prompt from Coach attach
- **THEN** the purpose string identifies Coach Watts chat / meal logging use
