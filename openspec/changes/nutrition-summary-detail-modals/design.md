## Context

Log nutrition (`NutritionSection`) and Today glance (`NutritionGlance`) already show calorie/macro actuals vs goals from `GET /api/nutrition`. Mapping via `pickTodayNutrition` keeps goals and `fuelState` but drops the rest of `fuelingPlan`, so the client cannot rebuild the web analysis breakdown.

On web, tapping a macro tile opens `MacroExplainModal.vue` (“{label} Analysis”) with: actual header, total daily target + progress bar, calculation-logic rows (calories vs carbs/protein/fat differ), coach insight, and Close. Mobile already uses page sheets for similar “tap glance → explain” flows (`MonthlyProgressSheet`, `TrainingLoadSheet`, `WellnessOverviewSheet`).

## Goals / Non-Goals

**Goals:**

- Let athletes tap calories / carbs / protein / fat on Log (primary) to open a native analysis sheet matching web content structure.
- Drive breakdown rows from retained `fuelingPlan` plus available athlete weight / nutrition settings.
- Keep business logic on the server; mobile only presents plan fields and mirrors web’s display-side reconstruction (same formulas as `MacroExplainModal`).
- Degrade gracefully when plan or settings slices are missing (still show actual, target, progress, and whatever rows can be derived).

**Non-Goals:**

- Hydration explain modal (web has a separate `HydrationExplainModal`).
- Editing nutrition settings, generating meal plans, grocery, or porting nutrition detail pages.
- New backend endpoints or changing fueling-plan computation.
- Making the entire Today nutrition card open analysis (card already deep-links to Log); per-metric taps on Today are optional parity, not required for v1 if Log is complete.

## Decisions

### 1. Page sheet, not a new route

**Choice:** One reusable `NutritionMacroExplainSheet` (React Native `Modal` + `presentationStyle="pageSheet"`), opened from local state keyed by macro label (`Calories` | `Carbs` | `Protein` | `Fat`).

**Why:** Matches existing companion sheet patterns and the web modal (overlay, not a stack screen). Avoids Expo Router churn for a dismissible explain surface.

**Alternatives:** Stack screen route — heavier back-stack semantics for a Close-driven overlay; bottom sheet library — inconsistent with current stats/performance sheets.

### 2. Retain typed `fuelingPlan` on day totals

**Choice:** Extend nutrition mapping types to keep a typed subset of `fuelingPlan` needed for analysis (`dailyTotals` fields: base/activity/adjustment/workoutCalories/fuelState/macros/fluid; `windows` with type + macro targets). Do not keep the entire opaque plan blob if unused.

**Why:** Analysis is impossible without plan breakdown; typed subset documents the contract and keeps tests focused.

**Alternatives:** Re-fetch `GET /api/nutrition/:id` on tap — extra latency and still needs the same mapping; call a dedicated explain API — does not exist and would invent a contract.

### 3. Settings / weight inputs for full parity

**Choice:**

- **Weight:** Reuse existing athlete profile (`weightKg`) already loaded for profile/metrics.
- **Nutrition settings:** Prefer `GET /api/profile/nutrition` when Bearer-accessible with existing scopes; cache via TanStack Query. If unavailable or fails, build calorie rows primarily from `fuelingPlan.dailyTotals` (baseline mode, workoutCalories, adjustmentCalories) and simplify macro rows to window allocations + energy + progress (skip settings-dependent g/kg baselines that would be wrong without settings).

**Why:** Web modal needs both plan and settings for full copy parity; companion must not invent settings. Fueling plan alone covers the calorie story shown in the product screenshot (manual baseline, EST workouts, goal adjustment).

**Alternatives:** Hard-require settings before enabling taps — worse UX when plan is present; duplicate settings into nutrition list payload — backend change out of scope unless needed later.

### 4. Port display logic into a pure TS module

**Choice:** Extract breakdown + coach-tip builders into `src/features/nutrition/macroExplain.ts` (and unit tests), mirroring web `MacroExplainModal` computed logic. Sheet is presentation-only.

**Why:** Keeps formulas testable without rendering; reduces drift risk vs ad-hoc UI strings.

**Alternatives:** Inline in the sheet component — harder to test; share package with web — overkill for v1.

### 5. Tap affordance only when explainable

**Choice:** Tiles are pressable when `hasGoals` (or equivalent: non-null goal for that metric) and/or `fuelingPlan` is present. Without a target/plan, tiles stay non-interactive (or open a minimal “no target for today” state — prefer non-interactive to avoid empty sheets).

**Why:** Empty calculation logic with zeros is confusing; matches “show analysis of daily targets.”

### 6. Visual language

**Choice:** Follow existing mobile sheet / NativeWind tokens (not a pixel-perfect dark web clone). Preserve structure: uppercase analysis title + accent icon, actual value, target card + bar, calculation-logic list with optional EST/ACTUAL badges, coach insight callout, Close. Metric accent colors can follow web (calories orange, carbs yellow, protein blue, fat green) if they fit the app palette; otherwise use existing nutrition tile accents.

## Risks / Trade-offs

- **[Drift from web formulas]** → Mitigation: pure TS module + unit tests against fixtures matching web cases; comment reference to `MacroExplainModal.vue`.
- **[`/api/profile/nutrition` not Bearer-ready]** → Mitigation: plan-first calorie breakdown works without settings; document open question; escalate to coach-wattz only if macro baselines look incomplete in QA.
- **[Payload size]** → Mitigation: retain only typed analysis fields, not unrelated plan meal blobs.
- **[Today vs Log dual entry]** → Mitigation: ship Log first; wire Today per-metric taps only if glance layout supports clear hit targets without fighting the existing “open Log” card press.

## Migration Plan

- No data migration. Ship behind normal app release.
- Rollback: revert client; no server schema change.

## Open Questions

1. Confirm Bearer access (and scopes) for `GET /api/profile/nutrition` from the mobile OAuth client. If missing, accept plan-only calorie rows + reduced macro rows for v1.
2. Include Today glance per-metric taps in the same change, or Log-only for v1?
3. Should water tile get a follow-up hydration explain sheet (web parity) in a later change?
