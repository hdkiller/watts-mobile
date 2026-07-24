## 1. API

- [x] 1.1 Confirm Bearer adapt action types + abandon + replan-structure contracts
- [x] 1.2 Add client mutations and error mapping (`friendlyError`)
- [x] 1.3 Gate replan UI on API readiness

## 2. Plan Training actions

- [x] 2.1 Adjust plan action sheet / menu
- [x] 2.2 Confirm dialogs for recalculate, push forward, replan, abandon
- [x] 2.3 Wire Start new → abandon-if-needed → shared generator
- [x] 2.4 Progress / failure UI using shared job poller patterns

## 3. Cache + QA

- [x] 3.1 Invalidate Plan, planned-workouts, Today queries on success
- [x] 3.2 Unit tests for adapt/abandon client helpers
- [x] 3.3 Manual smoke: push forward shifts Upcoming; abandon → empty; start new → generator
