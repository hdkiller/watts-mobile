# Hallmark review results — Coach Watts Mobile

Read-only `hallmark audit` pass against [`docs/DESIGN.md`](../DESIGN.md). Catalog: [`docs/hallmark-review-catalog.md`](../hallmark-review-catalog.md). Date: **2026-07-24**.

Audits are read-only snapshots from 2026-07-24. A follow-up patch pass (same day) addressed the recommended redesign order where it made sense — see **Patch log** below. Each surface file still lists Tell · Where · Severity · Fix from the audit.

## Grand totals

| Bucket | Surfaces | Critical | Major | Minor |
|--------|----------|----------|-------|-------|
| [Wave A](./wave-a/) — door / activation / subscription | 10 | 1 | 20 | 18 |
| [Wave B](./wave-b/) — Today / Log / Coach | 18 | 4 | 57 | 54 |
| [Wave C](./wave-c/) — session detail + glances | 9 | 1 | 29 | 17 |
| [Wave D](./wave-d/) — More / Settings / Health | 18 | 0 | 48 | 32 |
| [Stamped](./stamped/) — regression | 4 groups | 0 | 1 | 6 |
| **All** | **~59** | **6** | **155** | **127** |

Many majors are the same cross-cutting debt (especially **missing Hallmark stamp** on unstamped screens). Treat the criticals + unique majors as the redesign queue; stamps can be batch-added.

## Six criticals (fix first)

| # | Surface | Wave | Tell | Audit |
|---|---------|------|------|-------|
| 1 | Today home | B | First-viewport decision overload (dashboard stack) | [01-today-home.md](./wave-b/01-today-home.md) |
| 2 | Log tab | B | Quick-action icon grid / decorative hub | [07-log-tab.md](./wave-b/07-log-tab.md) |
| 3 | Subscription | A | Invented `border-warning` (non-semantic token) | [09-subscription.md](./wave-a/09-subscription.md) |
| 4 | Nutrition glance | C | Raw hex macro colors (`#fbbf24` / `#60a5fa` / `#a78bfa`) | [08-nutrition-glance.md](./wave-c/08-nutrition-glance.md) |
| 5 | Hydration quick-add | B | Raw `#60a5fa` hydration tint | [16-hydration-quick-add.md](./wave-b/16-hydration-quick-add.md) |
| 6 | Nutrition detail / macro explain | B | Macro ACCENT hex + Tailwind chroma bars | [17-nutrition-detail-sheets.md](./wave-b/17-nutrition-detail-sheets.md) |

## Cross-cutting patterns (all waves)

1. **Missing system stamps** — nearly every open/partial surface lacks `/* Hallmark · … design-system: docs/DESIGN.md */`.
2. **Spinner vs skeleton** — activation, many settings/health screens, several Today sheets still use full-screen `ActivityIndicator`.
3. **Palette drift** — `emerald-*`, `amber-*`, raw `#ef4444` / `#f59e0b` / sky hex / brand rgba washes instead of `success` / `modify` / `danger` / `recovery` / semantic tokens. Macro/hydration hex repeats across glance → quick-add → detail/explain.
4. **Hand-rolled buttons** — Continue/Retry/store CTAs bypass shared `Button`.
5. **Decorative icon circles + emoji** — More / Settings / Log / hydration presets fight “text is default, icons seasoning.”
6. **Stamped hubs hold** — Goals / Events / Athlete / Photo meal regression is clean aside from LogMealSheet chroma on the photo path.

## Suggested redesign order

1. **Today home** (critical) — collapse first viewport to one decision  
2. **Log tab** (critical) — retire icon-grid hub  
3. **Nutrition token lift** (glance + hydration + detail/macro criticals) — one shared palette  
4. **Subscription** (critical token + store CTA chrome)  
5. **Activation chapter** as one Narrative Workflow pass (spinners → skeletons, stamp)  
6. **Coach chat** + dictation danger chrome + **Recovery event** / meal sheet token cleanup  
7. **Planned + Activity detail** error chrome + stamps  
8. **More / Settings / Health / Measurements** batch: stamps, skeletons, icon quieting, palette

## Patch log (2026-07-24)

Shipped in-repo (not a full IA rewrite):

| Order item | What landed |
|------------|-------------|
| Nutrition tokens | `Colors.macro*` / `hydration` + Tailwind + `nutritionAccents.ts`; glance / section / targets / macro explain / hydration / meal macro bars |
| Subscription | `border-modify` collision, Coach Watts copy, skeletons, shared `Button` CTAs, stamp |
| Today | Stamp; Context fold kicker; camera hit target; modify quota shell; recovery line (no pill strip); success checkmarks |
| Log | Icon grid → text-first list; primary wellness CTA; banner skeleton; stamp (`log-meal` testID kept) |
| Activation | Stamps + load skeletons (incl. `_layout` gate) |
| Palette batch | emerald/amber/hex → `success` / `modify` / `danger` across More, Health, Coach, glances, settings |
| Auth | Login/instance stamps; instance Continue → `Button` |

**Deferred / lighter touch:** full Today section reordering (product still stacks glances by baseline); Measurement sheet polish beyond stamp.

### Patch log continued (majors pass)

| Item | What landed |
|------|-------------|
| Stamps | +40 P0–P1 routes/sheets stamped with DESIGN.md reference |
| Error chrome | Planned/Activity detail + Recent/Upcoming lists → tinted error card + Retry |
| Coach approvals | Approve/Deny → shared `Button` |
| More / Settings icons | Dropped circular emoji wells; quiet muted `AppSymbol` |
| Skeletons | Health Sync/workouts, Connected Apps, inbox, Settings (nutrition/units/coach/notifications), Sports, WellnessOverview, TrainingLoad, RoomList |

## Folder map

```
docs/hallmark-reviews/
├── README.md                 ← this index
├── wave-a/                   door, activation, subscription
├── wave-b/                   daily loop
├── wave-c/                   session truth
├── wave-d/                   account depth
└── stamped/                  regression on stamped hubs
```

Each wave folder has its own `README.md` with per-surface counts.
