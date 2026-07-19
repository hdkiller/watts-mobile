# store-ready Delta — App Chrome Essentials

## MODIFIED Requirements

### Requirement: Brand app icon and splash
The app SHALL ship Coach Watts branded icon and splash assets configured for iOS and Android store builds, and the Android notification small-icon accent color SHALL use the Coach Watts brand green rather than an off-brand color. Launch chrome (splash and home-screen icon) SHALL be verified on-device for both platforms before a store candidate is cut.

#### Scenario: Launch splash
- **WHEN** the user cold-starts a release/dev-client build
- **THEN** the splash uses Coach Watts branding (not a generic Expo placeholder)

#### Scenario: Notification accent on brand
- **WHEN** a push notification renders on Android
- **THEN** the small-icon accent uses the Coach Watts brand green

#### Scenario: Device-verified chrome
- **WHEN** preparing a store candidate build
- **THEN** the store checklist records a completed on-device verification of splash and icon for iOS and Android
