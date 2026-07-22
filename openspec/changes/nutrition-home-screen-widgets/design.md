## Context

The app has one `expo-widgets` component, `TodaySessionWidget`, declared for `systemSmall` and `systemMedium`. `syncTodayWidget` copies a small, display-ready snapshot into the widget extension whenever Today data is loaded. Nutrition already has equivalent app-side primitives: `NutritionDayTotals`, `NextFuelingWindow`, a date-scoped read, a next-window read, meal logging, hydration quick-add, and Log routes that open the nutrition summary or a specific sheet.

WidgetKit cannot be treated like a continuously connected React Native screen. It renders previously supplied props on an OS-controlled timeline, may be stale, and must not own OAuth credentials or assume the app process is active. The design therefore optimizes for a trustworthy glance and a precise handoff into the app.

## Goals / Non-Goals

**Goals:**

- Offer four clearly named widget choices rather than a single configurable mini-dashboard.
- Make day progress, hydration, and the next fueling decision readable in one glance.
- Reuse the existing nutrition API and Log flows.
- Keep snapshots account-safe and honest about age, missing goals, and disabled tracking.
- Support light, dark, and tinted widget rendering with semantic hierarchy and accessible text.

**Non-Goals:**

- Logging a meal or water directly from the extension without opening the app.
- Background API fetches or storing OAuth tokens in the widget/App Group.
- Nutrition planning, grocery lists, meal-plan generation, or a large dashboard widget.
- Combining the training-session widget and nutrition widgets.
- Android parity in the first release.

## Decisions

### 1. Ship four separate widget definitions

Declare `NutritionTodayWidget` (`systemSmall`, `systemMedium`), `HydrationWidget` (`systemSmall`), `NextFuelWidget` (`systemMedium`), and `PhotoFoodLogWidget` (`systemSmall`) alongside `TodaySessionWidget`.

Each widget answers one question:

| Widget | Athlete question | Primary content | Tap destination |
|---|---|---|---|
| Nutrition Today | “How much is left today?” | Calories, macro progress, hydration, fuel state | `coachwatts://log?section=nutrition` |
| Hydration | “Am I drinking enough?” | Water versus target | `coachwatts://log?action=water` |
| Next Fuel | “What do I need next?” | Window time, carbs, protein, workout context | `coachwatts://log?action=meal` |
| Photo Food Log | “Can I capture this meal now?” | Camera-first action | `coachwatts://log?action=photo` |

Separate definitions make the widget gallery understandable and allow each layout to use its family well. A single configurable widget was considered, but it adds configuration UI and makes snapshot/error behavior harder to reason about for little v1 benefit.

### 2. Use one normalized, versioned snapshot mapper

Add a pure mapper that accepts `NutritionDayTotals`, `NextFuelingWindow | null`, tracking-enabled state, and a timestamp. It returns display-ready primitive props shared by the three data-bearing widgets; Photo Food Log consumes only the mapped eligibility state needed to avoid offering camera capture when signed out or disabled:

- `schemaVersion`, `date`, `updatedAt`
- state: `ready | empty | noTargets | disabled | signedOut`
- calories, protein, carbs, fat, and water actual/goal values plus clamped progress percentages
- fuel-state label (`Eco`, `Steady`, `Performance`) only when provided
- next-window label, ISO start time, carb/protein targets, and optional workout title

Widgets format only family-specific presentation. Domain interpretation, clamping, missing-goal logic, and stale-state selection stay in ordinary TypeScript where they can be unit-tested. Raw API payloads and TanStack Query cache objects are not copied into the extension.

### 3. Sync after trusted app-side events

Create `syncNutritionWidgets` as an iOS no-op-safe helper similar to `syncTodayWidget`. Call it after:

1. a successful nutrition-day read when tracking is enabled;
2. a successful next-fueling-window read;
3. a successful meal or hydration write followed by refreshed totals;
4. app foreground when cached nutrition data is present;
5. nutrition tracking being disabled, sign-out, or account/instance change.

The sync coordinator may briefly retain the latest day and next-window results in memory so either query can arrive first without erasing the other. The persisted widget props remain the durable snapshot.

Timer-only background refresh was considered, but it would either require extension-side authentication or show misleading promises about freshness. The widget instead displays the snapshot’s age when it is no longer from the local current day or exceeds the agreed freshness threshold.

### 4. Keep the extension read-only; route actions into Log

Whole-widget taps use `widgetURL` and action controls use stable `Button.target` identifiers handled by `expo-widgets` interaction routing. Targets resolve through the canonical link layer to existing Log query parameters:

- `nutrition.openSummary` → `/(app)/(tabs)/log?section=nutrition`
- `nutrition.logMeal` → `/(app)/(tabs)/log?action=meal`
- `nutrition.addWater` → `/(app)/(tabs)/log?action=water`
- `nutrition.photoFood` → `/(app)/(tabs)/log?action=photo`

For `action=photo`, Log opens `LogMealSheet` and invokes its existing camera capture path once after the sheet is mounted. The app—not the widget extension—requests camera permission, launches `expo-image-picker`, calls the existing estimate endpoint, and presents analyzing → editable review → explicit Save meal. Camera cancellation returns to the open meal sheet; denied permission shows the existing recovery guidance. This is considered “instant” because no intermediate Log or compose tap is required when the athlete is already authenticated and eligible.

Logged-out taps use the existing pending-path/auth-return behavior but land on the camera-first meal sheet after authentication rather than launching the camera unexpectedly after a long interruption. If nutrition tracking is disabled, Log shows the normal disabled state rather than requesting camera access or attempting a write.

Direct widget writes were rejected for v1: the extension would need account/auth lifecycle ownership, failure feedback, retry semantics, and conflict handling. Opening the already-tested sheet is one extra tap but remains trustworthy.

### 5. Define honest presentation states

- **Ready:** render actual versus available targets and the snapshot time.
- **Empty:** show zero logged as an invitation to log, not as a completed or failed target.
- **No targets:** show actual totals without rings/bars that imply an invented denominator.
- **No next window:** Next Fuel falls back to “Daily fuel” with calorie/macro progress and opens meal logging.
- **Disabled:** show “Nutrition tracking is off” and open the nutrition/settings-aware Log surface.
- **Signed out/cleared:** show “Open Coach Watts to load nutrition”; no prior athlete values remain.
- **Stale:** retain the last values, label them with the last update/day, and avoid urgency language such as “now” or “remaining today.”

### 6. Minimize snapshot data and clear it on identity boundaries

The App Group receives totals, goals, progress, a coarse fuel-state label, and the next window. It does not receive meal names/history, photos, notes, tokens, user IDs, email, instance URL, or profile data. Sign-out, account switch, instance switch, and disabling nutrition tracking overwrite all widget definitions with cleared-state props before local auth/cache teardown completes.

### 7. Reuse the existing extension and require a native rebuild

Add declarations to the existing `expo-widgets` plugin entry, keeping `com.coachwatts.app.todaywidget` and `group.com.wattmind.coachwatts`. Because widget declarations change the generated native target, implementation completion requires a clean iOS prebuild when appropriate, Xcode signing verification, and a rebuilt binary; Metro reload alone is insufficient.

## Risks / Trade-offs

- **[Stale values after logging elsewhere]** → Always show snapshot age/day when stale and refresh on foreground; do not claim live data.
- **[Sensitive data visible on a shared or locked device]** → Store only coarse day totals and provide a future privacy toggle if store review or user feedback requires it. Do not include meal names or free text.
- **[Too many gallery choices]** → Limit v1 to four sharply differentiated widgets and no large family.
- **[Camera cannot run inside WidgetKit]** → Treat the widget as a user-initiated deep link; launch the system camera immediately from the foreground app and keep permission, analysis, review, and save feedback there.
- **[Repeated camera launch on route re-render]** → Consume the `action=photo` intent once and clear/replace the query state before opening the camera.
- **[Small-family density]** → Prioritize one number and at most three compact secondary values; verify on the smallest supported devices and at larger Dynamic Type sizes.
- **[Interaction event lost during cold start]** → Prefer canonical URLs for navigation and treat button targets as routing hints; cover cold-start and logged-out cases in manual smoke tests.
- **[Native target/signing regression]** → Preserve the current extension identifiers, regenerate with `expo prebuild`, and validate both the app and embedded extension before store work.
- **[Android expectation gap]** → Label the implementation and release notes as iOS-first; track Android widget support as a separate follow-up after the Expo Android path is validated in this repository.

## Migration Plan

1. Add pure snapshot types/mappers and tests without changing native configuration.
2. Add the four widget components and app-side sync/clear helpers.
3. Add navigation targets and query/mutation lifecycle hooks.
4. Add widget declarations, then rebuild the iOS native project and verify signing/App Group access.
5. Exercise ready, empty, missing-target, stale, signed-out, disabled, camera-denied, camera-cancelled, and photo-review states in light/dark/tinted modes.
6. Ship behind the binary version containing the new extension bundle. Rollback is removal of the new declarations/components in a later binary; existing installed widgets then show the OS placeholder until the user removes them, so pre-release validation is required.

## Open Questions

- Should a later release add accessory Lock Screen families after the four home-screen widgets prove useful?
- Does product want an explicit “Hide nutrition on widgets” privacy preference, or is removing the widget itself sufficient for v1?
- Should Android parity use the experimental `expo-widgets` Android support in this Expo version or wait for it to become the project’s supported default?
