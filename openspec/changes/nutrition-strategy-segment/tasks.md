## 1. API + state

- [x] 1.1 Confirm Bearer + scopes on `strategy`, `extended-wave`, `active-feed`, `hydration-reset` — **`nutrition:read` / `nutrition:write` via `requireAuth`**
- [x] 1.2 Measure the `extended-wave` payload for a 7-day horizon; decide the mobile default range or request a mobile-shaped variant — **default `daysAhead=3` (match web); downsample to ≤72 chart points**
- [x] 1.3 Add strategy / extended-wave / active-feed fetchers to `src/features/nutrition/api.ts`
- [x] 1.4 Add hooks with independent query keys so each block degrades on its own
- [x] 1.5 Mappers + unit tests for strategy, wave points, and feed entries

## 2. Strategy UI

- [x] 2.1 Strategy | Plan segment control inside Plan → Nutrition
- [x] 2.2 Fuel state block with explanation sheet, reusing the macro-explain pattern
- [x] 2.3 Hydration standing: debt, status, server advice copy verbatim
- [x] 2.4 Hydration reset, shown only when the server sets the flush prompt, behind a confirm
- [x] 2.5 Active fueling feed with honest empty copy
- [x] 2.6 Phone-sized energy horizon built on existing chart primitives; web escape when not legibly representable
- [x] 2.7 Per-block error states; one failure must not blank the view
- [x] 2.8 Tracking-off honesty covering both segments

## 3. Integration + QA

- [x] 3.1 Fetch on segment focus, not on Plan tab mount
- [x] 3.2 Confirm no duplication of Today's next-window glance
- [x] 3.3 testIDs for the segment control, fuel state, hydration reset, and horizon
- [ ] 3.4 Manual: strategy renders → force one endpoint to fail and confirm the rest survive → flush prompt appears → reset updates standing
