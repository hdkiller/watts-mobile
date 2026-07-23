# Hallmark audits · Wave C — Session truth
- **Date:** 2026-07-24
- **Design system:** docs/DESIGN.md
- **Scope:** Planned/activity detail + charts, upcoming/recent lists, Today glance helpers (monthly progress, ad-hoc sheet, nutrition, events)
- **Mode:** Read-only audit (no app source edits)

## Counts

| # | Surface | File | Stamp | Critical | Major | Minor | Total |
|---|---------|------|-------|----------|-------|-------|-------|
| 01 | Planned workout detail | [01-planned-detail.md](./01-planned-detail.md) | missing | 0 | 4 | 3 | 7 |
| 02 | Activity detail | [02-activity-detail.md](./02-activity-detail.md) | missing | 0 | 3 | 2 | 5 |
| 03 | Activity charts | [03-activity-charts.md](./03-activity-charts.md) | missing | 0 | 3 | 1 | 4 |
| 04 | Upcoming planned list | [04-upcoming-list.md](./04-upcoming-list.md) | missing | 0 | 3 | 2 | 5 |
| 05 | Recent activity list | [05-activity-list.md](./05-activity-list.md) | missing | 0 | 3 | 1 | 4 |
| 06 | Monthly progress sheet | [06-monthly-progress-sheet.md](./06-monthly-progress-sheet.md) | missing | 0 | 5 | 2 | 7 |
| 07 | Create ad-hoc workout sheet | [07-ad-hoc-workout-sheet.md](./07-ad-hoc-workout-sheet.md) | missing | 0 | 3 | 2 | 5 |
| 08 | Nutrition glance | [08-nutrition-glance.md](./08-nutrition-glance.md) | missing | 1 | 3 | 2 | 6 |
| 09 | Upcoming events glance | [09-upcoming-events-glance.md](./09-upcoming-events-glance.md) | missing | 0 | 2 | 2 | 4 |
| | **Wave C total** | | **9/9 missing** | **1** | **29** | **17** | **47** |

## Hotspots (fix first)

1. **Nutrition glance raw hex** (`#fbbf24` / `#60a5fa` / `#a78bfa`) — only Wave C **critical**.
2. **Status/delta palette drift** — `text-emerald-400` / `text-amber-300` on activity list + monthly delta; HR chart hex should be `Colors.recovery`.
3. **Universal missing stamps** — all nine surfaces need DESIGN.md system reference.
4. **Error chrome** — detail + list screens still use bare red text instead of tinted error + Retry.
5. **Spinners vs skeletons** — charts, monthly sheet, nutrition glance initial loads.

## Out of scope (skipped)
- Web landing / marketing tells
- Full Today home composition (Wave B)
- Chart SVG geometry beyond token/skeleton issues
