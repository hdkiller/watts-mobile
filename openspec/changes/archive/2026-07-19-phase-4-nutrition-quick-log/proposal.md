## Why

Nutrition tracking is a natural mobile write — athletes log meals and hydration away from the desk. Product baseline promotes **nutrition quick-log** to v1.5 while keeping nutrition planning and grocery on web.

## What Changes

- Log tab gains a **Nutrition** section (or Log stack screen): today’s totals glance, quick-add meal/macro item, hydration quick-add
- Wire `GET/POST /api/nutrition` with `nutrition:read` / `nutrition:write`
- Add those scopes to companion OAuth
- Open web escape for meal plans, grocery, strategy / metabolic wave depth
- Empty/loading/error + save feedback

## Capabilities

### New Capabilities

- `nutrition-quick-log`: Log-surface nutrition totals, meal/macro quick-log, hydration quick-add

### Modified Capabilities

- `oauth-pkce`: Companion authorization MUST request `nutrition:read` and `nutrition:write` (and keep `profile:write` aligned with v1.5 athlete metrics)

## Impact

- **watts-mobile:** Log UI; `src/features/nutrition/`; scopes update
- **coach-wattz:** Nutrition list/upload already Bearer-scoped; confirm Official Mobile App allowlist for `nutrition:*`; Bearer-enable hydration quick-add (or equivalent) if still session-only
- **Out of scope:** Meal plan generation, grocery lists, barcode/camera OCR, full nutrition dashboard / metabolic wave UI
