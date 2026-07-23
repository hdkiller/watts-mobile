# Hallmark audits · Wave D — Account depth

- **Date:** 2026-07-24
- **Design system:** [docs/DESIGN.md](../../DESIGN.md)
- **Protocol:** Tell · Where · Severity · Fix (grouped by severity)
- **Scope:** More hub, Settings, Health Sync family, Connected Apps, Sports, Not found, Tab bar, Measurement sheets
- **Constraint:** Read-only audit — no app source edits

## Counts table

| # | Surface | File | C | M | m | Top issues |
|---|---------|------|---|---|---|------------|
| 01 | More home | [01-more-home.md](./01-more-home.md) | 0 | 3 | 2 | missing stamp · decorative icon circles · `#ef4444` hex |
| 02 | Notification inbox | [02-notification-inbox.md](./02-notification-inbox.md) | 0 | 2 | 3 | missing stamp · full-screen spinner |
| 03 | Settings hub | [03-settings-hub.md](./03-settings-hub.md) | 0 | 2 | 1 | missing stamp · decorative icon circles |
| 04 | Appearance | [04-appearance.md](./04-appearance.md) | 0 | 1 | 2 | missing stamp |
| 05 | Notifications prefs | [05-notifications-prefs.md](./05-notifications-prefs.md) | 0 | 3 | 2 | missing stamp · spinner · amber/hex drift |
| 06 | Units | [06-units.md](./06-units.md) | 0 | 3 | 1 | missing stamp · spinner · `emerald-400` |
| 07 | Log defaults | [07-log-defaults.md](./07-log-defaults.md) | 0 | 1 | 3 | missing stamp |
| 08 | Coach identity | [08-coach-identity.md](./08-coach-identity.md) | 0 | 4 | 2 | stamp · spinner · one-off button · emerald |
| 09 | Nutrition settings | [09-nutrition-settings.md](./09-nutrition-settings.md) | 0 | 4 | 2 | stamp · spinner · hand-rolled Retry · error chrome |
| 10 | Health Sync | [10-health-sync.md](./10-health-sync.md) | 0 | 4 | 2 | stamp · spinner · emerald/amber/hex · icon circle |
| 11 | Health workouts | [11-health-workouts.md](./11-health-workouts.md) | 0 | 3 | 1 | stamp · spinner · status palette drift |
| 12 | Health history | [12-health-history.md](./12-health-history.md) | 0 | 2 | 2 | stamp · status palette drift |
| 13 | Connected Apps | [13-connected-apps.md](./13-connected-apps.md) | 0 | 3 | 2 | stamp · spinner · status dots |
| 14 | Sports list | [14-sports-list.md](./14-sports-list.md) | 0 | 2 | 1 | stamp · spinner (SportsSection) |
| 15 | Sport detail | [15-sport-detail.md](./15-sport-detail.md) | 0 | 5 | 1 | stamp · spinner · one-off CTAs · emerald · error |
| 16 | Not found | [16-not-found.md](./16-not-found.md) | 0 | 1 | 2 | missing stamp |
| 17 | Tab bar | [17-tab-bar.md](./17-tab-bar.md) | 0 | 1 | 1 | missing stamp (tokens otherwise clean) |
| 18 | Measurement sheets | [18-measurement-sheets.md](./18-measurement-sheets.md) | 0 | 4 | 2 | stamp · brand rgba wash · spinner · pill chips |

**Wave D total: 0 critical · 48 major · 32 minor**

## Cross-cutting patterns

1. **Every surface lacks a Hallmark stamp** → 18× `missing system reference` (major).
2. **Spinner instead of skeleton** on most data screens (inbox, prefs, units, coach, nutrition, health family, sports, connected apps, measurements).
3. **Decorative icon circles + emoji** on More home and Settings hub fight “text is default, icons seasoning.”
4. **Palette drift:** `emerald-*`, `amber-*`, raw `#ef4444` / `#f59e0b` / brand `rgba(0,220,130,…)` instead of `success` / `modify` / `danger` / tokenized brand wash.
5. **Hand-rolled buttons** on Coach identity, Nutrition Retry, Sport detail secondary CTAs — should use shared `Button`.
6. **Tab bar** is the cleanest chrome once stamped — already on semantic theme colors.

## Cleanest / messiest

- **Cleanest:** Tab bar, Appearance, Log defaults, Not found (stamp-only / light majors).
- **Messiest:** Sport detail (5 major), Measurement sheets / Health Sync / Nutrition / Coach (4 major each).
