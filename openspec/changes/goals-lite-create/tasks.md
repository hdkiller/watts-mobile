## 1. Docs

- [x] 1.1 Update product-baseline / open-questions / implementation-plan: post-activation goal **create** in-app; edit/delete/AI stay web
- [x] 1.2 Update `docs/gaps/goals-events-mobile-vs-web.md` for create parity
- [x] 1.3 Mirror note in coach-wattz `docs/06-plans/mobile-companion-app.md` if needed

## 2. Create UI & API

- [x] 2.1 Add `/(app)/goals/new` (or equivalent form-sheet) route + stack registration
- [x] 2.2 Build create form (type, title, target date, type-specific minimum fields, priority)
- [x] 2.3 Wire `createGoal` mutation; invalidate goals / primary-goal queries; navigate to detail on success
- [x] 2.4 Add Create / Add affordances on Goals list + empty state (keep Manage on web)

## 3. Verification

- [x] 3.1 Unit tests for create payload mapping / validation helpers if added
- [ ] 3.2 Manual: create each goal type; list/detail refresh; Manage on web still works
