# theme-tokens — Delta Spec

## ADDED Requirements

### Requirement: Semantic neutral tokens resolve per theme
The app SHALL define semantic neutral color tokens — `surface`, `card`, `border`, `border-strong`, `text-primary`, `text-body`, `text-muted`, and error/success tint pairs — with one dark and one light value each (canonical table in docs/DESIGN.md), available as Tailwind/NativeWind classes and as a JS accessor. Brand and state accents (brand, brand-action, recovery, modify, danger, zone ramp) SHALL remain theme-invariant.

#### Scenario: Component styled with tokens renders correctly in both themes
- **WHEN** a component uses only semantic token classes (e.g. `bg-card border-border text-text-primary`) and the OS appearance switches between light and dark
- **THEN** the component renders the corresponding dark or light values from the token table without any per-component theme logic

#### Scenario: JS color consumer follows the active theme
- **WHEN** a chart, map, refresh-control tint, or navigation option obtains colors via the theme accessor while the OS appearance is light
- **THEN** it receives the light values for semantic tokens and the unchanged values for brand/state accents

### Requirement: App follows the OS appearance
The app SHALL declare `userInterfaceStyle: "automatic"` and update its UI (screens, navigation chrome, tab bar, status bar, splash-adjacent surfaces) when the OS appearance changes, without requiring an app restart, unless the athlete has overridden appearance in Settings.

#### Scenario: OS switches appearance while the app is running
- **WHEN** the device switches from dark to light appearance with the app foregrounded and appearance preference is System
- **THEN** visible screens, header/tab chrome, and the status bar re-render with light token values

### Requirement: Athlete can override appearance in Settings
The app SHALL expose a Settings → Appearance preference with System, Light, and Dark options. The choice SHALL persist on-device and apply immediately via an app-level color-scheme override. System SHALL clear the override and follow the OS again.

#### Scenario: Athlete picks Light in Settings
- **WHEN** the athlete selects Light on Settings → Appearance
- **THEN** the app renders light token values even if the OS appearance is dark, and the preference is restored on next launch

### Requirement: Components use no raw neutral palette values
UI components SHALL NOT reference raw neutral palette classes (e.g. `zinc-*` colors) or neutral hex literals directly; all neutral colors go through semantic tokens. A lint or CI check SHALL enforce this outside `src/theme/`.

#### Scenario: Raw neutral introduced in a component
- **WHEN** a change adds `bg-zinc-900` or `#09090b` to a file under `app/` or `src/` (excluding `src/theme/`)
- **THEN** the lint/CI guardrail reports a violation

### Requirement: Contrast rules hold in both themes
Text on brand green SHALL always be dark ink in both themes, and muted text SHALL meet WCAG AA contrast against `surface` and `card` in both themes.

#### Scenario: Muted text on light surface
- **WHEN** `text-muted` renders on the light `surface` or `card` background at body size
- **THEN** the measured contrast ratio is at least 4.5:1 (value adjusted for light if needed)
