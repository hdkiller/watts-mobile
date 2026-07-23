## 1. Docs

- [x] 1.1 Update product-baseline / open-questions / implementation-plan for More → Goals & Events hubs; manage on web
- [x] 1.2 Mirror IA note in coach-wattz `docs/06-plans/mobile-companion-app.md` if needed

## 2. More IA & routes

- [x] 2.1 Add More → Goals and More → Events menu rows + `APP_HREFS` entries
- [x] 2.2 Add `/(app)/goals` list and `/(app)/goals/[id]` detail stack screens
- [x] 2.3 Wire More → Events to existing `/(app)/events` list

## 3. Goals hub UI

- [x] 3.1 Goals list from `GET /api/goals` with empty/error/retry and Open web manage
- [x] 3.2 Goal detail read-only (fields + linked events → event detail)
- [x] 3.3 Rewrite Athlete `GoalsLiteSection` to summary + navigate (remove inline rename)

## 4. Events polish

- [x] 4.1 Ensure Events list empty/manage affordance offers Open web `/events`
- [x] 4.2 Confirm Today glance “See all” and More → Events share the same list route

## 5. Verification

- [x] 5.1 Unit tests for goal list/detail mappers if new mapping is added
- [x] 5.2 Manual: More → Goals/Events; Athlete summary → Goals; Open web manage handoff
