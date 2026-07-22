## Why

In-sheet AI photo estimate already works (`POST /api/nutrition/estimate-photo`), but after analysis the sheet silently pre-fills fields — athletes often miss that results arrived. After Save, the sheet closes immediately, so they never see how the meal moved today’s nutrition progress. The pipeline is solid; the accept and payoff moments are not.

## What Changes

- Add an explicit **estimate review** mode after photo analysis (analyzing state → review card → save), instead of silent form prefill.
- Surface editable meal name, calories, macros, meal slot, optional confidence, and a photo thumbnail in that review state.
- Offer **Retake** / clear estimate without forcing a full sheet dismiss.
- After a successful meal save (photo or manual), show a short **Logged** confirmation with **updated day nutrition progress** before dismissing (or with an explicit Done).
- Keep Coach “log with photo” as an alternate path; do not replace manual quick-log or hydration.
- No new coach-wattz endpoints; reuse existing nutrition read/write and estimate-photo APIs.

## Capabilities

### New Capabilities
- `nutrition-photo-estimate-ux`: In-sheet photo capture → analyzing → estimate review/accept UX for meal logging, including retake and confidence display when provided.

### Modified Capabilities
- `nutrition-quick-log`: Successful meal save SHALL present updated day nutrition progress / confirmation before the log sheet fully dismisses; clarify that in-sheet AI photo estimate is a first-class Log Meal path alongside Coach photo attach.

## Impact

- **Mobile UI:** `LogMealSheet` (primary), possibly shared progress presentation via `NutritionTargetsCard` / Log tab totals.
- **APIs (unchanged):** `POST /api/nutrition/estimate-photo`, `POST /api/nutrition`, `GET /api/nutrition` (day totals refresh).
- **Scopes (unchanged):** `nutrition:read`, `nutrition:write`, plus estimate-photo’s existing `chat:write` requirement on the server.
- **Out of scope:** Nutrition plan generation, grocery, Coach chat photo-tool logging redesign, auto-save without confirm, gamified streaks/confetti.
