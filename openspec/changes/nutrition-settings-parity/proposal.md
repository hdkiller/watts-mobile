## Why

Athletes can quick-log meals and hydration on mobile, but calorie/macro/fluid targets and dietary calibration still require opening web Profile → Nutrition. Activation companions should let athletes turn tracking on and tune metabolic, constraint, fueling, and hydration settings without leaving the app. Planning and grocery remain web control-room depth.

## What Changes

- Add Settings → **Nutrition** with native field parity for web Profile → Nutrition (`NutritionSettings.vue`): tracking toggle, metabolic/calories, meal schedule, dietary constraints, fuel calibration, adaptive engine, hydration (including three quick-add volumes).
- Wire mobile to `GET/POST /api/profile/nutrition` with existing scopes `nutrition:read` / `nutrition:write`.
- Require coach-wattz Bearer auth on those endpoints (today they are cookie-session only).
- Use saved `quickAddVolumes` in the hydration quick-add sheet; fetch settings for macro explain baselines.
- Keep meal-plan generate, grocery, day regenerate, chart prefs, Danger Zone wipe, and per-workout fueling strategy override as Open web.
- **BREAKING (product baseline):** Nutrition settings are no longer an implicit Profile Settings non-goal; planning/grocery stay out.

## Capabilities

### New Capabilities

- `nutrition-settings`: Native Settings → Nutrition editor with web Profile → Nutrition field parity, save via `POST /api/profile/nutrition`, and query invalidation so Log/Today targets refresh after fueling recalc.

### Modified Capabilities

- `settings-hub`: Add a Nutrition row under App Preferences that opens the native editor.
- `nutrition-quick-log`: Hydration presets come from nutrition settings (three volumes); Open web remains for planning/grocery only.

## Impact

- **Mobile:** new settings route + form, TanStack Query for settings, hydration preset wiring, macroExplain settings fetch, product baseline / open-questions / implementation-plan updates.
- **coach-wattz (required):** `requireAuth` on `GET/POST /api/profile/nutrition` with `nutrition:read` / `nutrition:write`; POST may recalculate ~14 days of fueling plans when tracking is on.
- **Product/docs:** baseline reposition for nutrition settings in-scope; planning/grocery remain web-only.
