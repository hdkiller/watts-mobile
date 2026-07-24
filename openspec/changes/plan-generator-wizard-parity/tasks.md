## 1. Helpers and API wiring

- [x] 1.1 Add helpers for local startDate ISO, endDate from goal target/event, and endDate from duration weeks; unit tests
- [x] 1.2 Ensure `initializePlan` always can send `endDate`; ensure `activatePlan(planId, startDate)` is used from the panel
- [x] 1.3 Map initialize `plan.blocks` into a compact phase-glance model for preview UI

## 2. Goal step in generator

- [x] 2.1 Load goals via `useGoalsQuery` inside `PlanGeneratorPanel`; select state with defaults (1 → auto, many → primary/prop, 0 → empty)
- [x] 2.2 UI: selectable goal list (title, type, target date, priority) + Create goal link to existing goals/new
- [x] 2.3 Refetch/select on return from create; block Generate when no `goalId`
- [x] 2.4 Make `goalId` prop optional default only; hosts still pass preferred id when known

## 3. Calendar + approach

- [x] 3.1 Start date control (default today local)
- [x] 3.2 End mode: From goal vs Duration (4–52); block initialize when end unresolved
- [x] 3.3 Send `startDate` + `endDate` on initialize; pass same start on activate

## 4. Preview polish

- [x] 4.1 Show phase/block glance above first-week sessions before activate
- [x] 4.2 Keep provisional honesty copy; no block editing

## 5. Hosts and docs

- [x] 5.1 Activation plan host: fall back to `usePrimaryGoalQuery` when `primaryGoalId` missing
- [x] 5.2 Plan create host: continue primary default into panel prop
- [x] 5.3 Update open-questions / DESIGN note if needed for deferred anchors
- [x] 5.4 Vitest for new helpers; smoke the goal → generate → preview → activate path manually
