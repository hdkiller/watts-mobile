## Why

Coach Watts currently offers one home-screen widget for today’s training session, while nutrition tracking requires navigating into the app before an athlete can see progress or act. Nutrition is especially suited to widgets because the useful questions are small and time-sensitive: “How much is left?”, “What should I fuel next?”, and “Can I capture this meal before I forget?”

## What Changes

- Add an iOS **Nutrition Today** widget in small and medium families. Small emphasizes calories remaining and macro progress; medium adds the day’s Eco / Steady / Performance fuel state and compact carbs, protein, fat, and hydration progress.
- Add an iOS **Hydration** widget in the small family showing water versus the daily fluid target, with a prominent action that opens Log directly to hydration quick-add.
- Add an iOS **Next Fuel** widget in the medium family showing the next available fueling window, timing, workout context, and carb/protein targets; fall back to a useful daily-progress state when no window exists.
- Add an iOS **Photo Food Log** widget in the small family with a prominent camera action. For an authenticated athlete with nutrition tracking enabled, tapping it launches Coach Watts directly into camera capture, then the existing AI estimate review and explicit Save meal flow.
- Deep-link every widget to the narrowest useful in-app destination: nutrition summary, meal log, camera-first photo log, or hydration quick-add. The widget extension remains read-only, does not access the camera itself, and does not perform authenticated nutrition writes.
- Sync a privacy-conscious nutrition snapshot to the widget extension after a successful nutrition read or write, on app foreground, and when the active account or nutrition-tracking setting changes.
- Provide honest locked, disabled, empty, stale, and no-target states; never fabricate targets or imply that zero intake means data is current.
- Keep **Today’s session** as a separate widget rather than combining training and nutrition into a crowded dashboard widget.
- Scope the first release to the existing iOS `expo-widgets` extension. Android widget parity is a follow-up once the project selects and validates an Android widget implementation.

## Capabilities

### New Capabilities

- `nutrition-home-screen-widgets`: Nutrition progress, hydration, next-fueling, and camera-first food-log home-screen widgets; snapshot lifecycle; privacy and empty states; and widget-to-app actions.

### Modified Capabilities

- `nutrition-quick-log`: Accept narrow widget deep links into the nutrition summary, meal logging, camera-first photo estimate, and hydration quick-add flows without changing the existing server contracts.

## Impact

- **Mobile code:** new widget components under `widgets/`, shared nutrition snapshot mapping/sync logic, widget interaction routing, and nutrition query/mutation integration.
- **Native configuration:** additional widget declarations in the existing `expo-widgets` plugin configuration, followed by an iOS prebuild and binary rebuild. The existing App Group and widget bundle identifier remain authoritative.
- **APIs:** reuse `GET /api/nutrition`, `POST /api/nutrition`, `POST /api/nutrition/estimate-photo`, and the Bearer-capable hydration quick-add path. No new coach-wattz endpoint is required for v1; Next Fuel is shown only when the existing nutrition payload supplies a fueling window.
- **Authentication/privacy:** snapshots contain only day-level totals, targets, fuel state, and the next fueling window—no meal names, photos, free text, tokens, or account identifiers. Snapshot data is cleared on sign-out, account/instance switch, or when nutrition tracking is disabled.
- **Product boundaries:** no meal-plan generation, grocery editing, calorie-plan administration, or background authenticated write from the extension.
