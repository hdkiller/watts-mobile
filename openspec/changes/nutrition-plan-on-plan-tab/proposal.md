## Why

Plan tab Nutrition is still a placeholder while Log/Settings cover quick-log and preferences. Athletes need the web nutrition **Plan** tab capabilities on device — weekly meal plan, draft generate, meal done/skip/replace, day regenerate, and grocery — so Plan is a true Training | Nutrition companion surface.

## What Changes

- Replace Plan → Nutrition placeholder with a weekly nutrition plan surface (week nav, day rows, targets/progress).
- Support draft generate (`POST /api/nutrition/plan/generate`), single-day fueling regenerate (`POST /api/nutrition/generate-plan`), and meal actions (complete / skip / unlock / replace + lock from recommendations).
- Ship grocery list read (`GET /api/nutrition/grocery`) for planned non-skipped meals with range picker.
- Gate on nutrition tracking enabled; when off, honest Settings → Nutrition CTA.
- Keep Log as write-first quick-log; Plan Nutrition owns planning. Home-screen widgets remain a separate change.

## Capabilities

### New Capabilities

- `nutrition-plan`: Weekly nutrition plan on Plan tab — generate, meal actions, day regen, grocery list.

### Modified Capabilities

- `plan-tab`: Nutrition segment becomes the nutrition-plan surface (remove placeholder requirement).
- `nutrition-quick-log`: Clarify Log remains quick-log/photo/hydration writes; planning lives on Plan → Nutrition (no requirement change to log APIs unless deep links need Plan targets).

## Impact

- **Mobile:** Plan Nutrition UI; `src/features/nutrition` plan API/hooks; grocery screen/sheet; query keys; Maestro Plan Nutrition path.
- **coach-wattz:** Bearer on nutrition plan/generate/meal/grocery routes (confirm allowlist).
- **Sequencing:** after `plan-tab-shell` (segments exist). Can follow training generator train or ship once shell is in.
