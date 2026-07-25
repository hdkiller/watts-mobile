## 1. API + mapping

- [x] 1.1 Confirm Bearer read for active/current plan (`GET /api/plans/active` or documented equivalent) and document fields needed for header/timeline
- [x] 1.2 Add/extend `src/features/plans` fetch + mapper for active plan shell model (title, phase, weeks metadata)
- [x] 1.3 Compose current-week planned workouts from existing planned-workouts query (reuse mini-chart mapping)

## 2. Tab shell

- [x] 2.1 Add `plan` NativeTabs trigger between Today and Log with SF/MD icons + label Plan
- [x] 2.2 Create `app/(app)/(tabs)/plan` route (index + segment host)
- [x] 2.3 Implement Training | Nutrition segmented control
- [x] 2.4 Wire Nutrition placeholder (honest copy; optional Open web `/nutrition`)
- [x] 2.5 Update href helpers / deep-link map if Plan destinations are named

## 3. Training read UI

- [x] 3.1 Active plan header + phase/week context
- [x] 3.2 Season timeline read (lite proportional blocks when data present; honest omit if not)
- [x] 3.3 Current-week session list → planned detail; empty week honesty
- [x] 3.4 Empty no-plan state + Create plan CTA stub (route/host for generator change)
- [x] 3.5 Open web affordance for templates/share/publish leftovers

## 4. Specs / QA

- [x] 4.1 Unit tests for active-plan / week composition mappers
- [x] 4.2 Update Maestro / testIDs if tab bar or Plan entry is covered (`docs/e2e.md`)
- [x] 4.3 Manual smoke: soft-activated → five tabs; Plan Training empty + active; Nutrition placeholder; More → Upcoming still works
