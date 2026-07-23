# Hallmark review catalog — Coach Watts Mobile

Utilitarian backlog for design passes. Audience: product/design owner. Job: pick the next surface to `hallmark audit` or `hallmark redesign` without inventing a second visual system — all work defers to [`DESIGN.md`](./DESIGN.md).

**Audit results (2026-07-24):** full pass written under [`hallmark-reviews/`](./hallmark-reviews/README.md) — **6 critical · 155 major · 127 minor** across Waves A–D + stamped regression (includes GAP surfaces: boot, teasers, hydration/nutrition sheets, tab bar, measurements, coach dictation). Prefer that index for punch lists; this catalog remains the priority map.

**Status key**

| Status | Meaning |
|--------|---------|
| `done` | Hallmark stamp present; treat as regression-only unless brief changes |
| `audited` | Read-only Hallmark audit on file (see `hallmark-reviews/`) — redesign not yet applied |
| `open` | No Hallmark pass yet |
| `partial` | Touched / polished in feature work; no full Hallmark stamp |

**Priority**

| Pri | Rule |
|-----|------|
| **P0** | First-viewport daily loop or activation door — athlete sees it every session |
| **P1** | Core write / detail / decision surfaces on the main path |
| **P2** | Hubs, lists, settings — frequent but secondary |
| **P3** | Chrome, edge cases, web-handoff shells |

**How to use**

1. Pick the highest open/partial P0–P1 row.
2. Run `hallmark audit <path>` (read-only punch list) or `hallmark redesign <path>` (in-place visual pass).
3. Keep stamps + update this table’s Status column when a pass lands.
4. Diversify macrostructure vs the last few app runs (see [`.hallmark/log.json`](../.hallmark/log.json)) — recent app stamps are mostly **Workbench**; prefer Narrative Workflow / Letter / other app-fit shapes when redesigning.

---

## 0 · Already stamped (skip unless regressing)

| Surface | Route / file | Macro | Notes |
|---------|--------------|-------|-------|
| Goals hub list | `app/(app)/goals/index.tsx` | Workbench | + lite create |
| Goal detail | `app/(app)/goals/[id].tsx` | Workbench | |
| Goal create | `app/(app)/goals/new.tsx` | Workbench | |
| Goals lite teaser | `src/features/goals/GoalsLiteSection.tsx` | Workbench | Athlete profile embed |
| Events hub list | `app/(app)/events/index.tsx` | Workbench | |
| Event detail | `app/(app)/events/[id].tsx` | Workbench | |
| Event create | `app/(app)/events/new.tsx` | Workbench | |
| Athlete profile | `app/(app)/athlete.tsx` + `AthleteProfileOverview.tsx` | Workbench | |
| Athlete report sheet | `src/features/profile/AthleteReportSheet.tsx` | Workbench | |
| Photo meal flow | `src/features/nutrition/PhotoMealFlowScreen.tsx` | Narrative Workflow | Entry: `log/photo-meal` |

---

## 1 · Door — auth & instance · P0–P1

| # | Surface | Route / file | Pri | Status | Why review |
|---|---------|--------------|-----|--------|------------|
| 1.1 | Login / sign-in | `app/(auth)/login.tsx` | P0 | audited | Brand first contact; OAuth + Apple; store screenshots |
| 1.2 | Instance URL | `app/(auth)/instance.tsx` | P1 | audited | Self-hosted first-class; error honesty |
| 1.3 | Boot / index redirect | `app/index.tsx` | P3 | audited | Flash / skeleton only |

---

## 2 · Activation wizard · P0

Server-resumable path. Soft-activated athletes leave this chapter for tabs.

| # | Surface | Route / file | Pri | Status | Why review |
|---|---------|--------------|-----|--------|------------|
| 2.1 | Activation home / resume | `app/(activation)/index.tsx` | P0 | audited | Wizard door; incomplete vs resume |
| 2.2 | Consent | `app/(activation)/consent.tsx` | P0 | audited | Blocking legal + health; store review |
| 2.3 | Goal lite | `app/(activation)/goal.tsx` | P0 | audited | First goal capture (vs hub create) |
| 2.4 | Plan lite | `app/(activation)/plan.tsx` | P0 | audited | Availability → preview → activate |
| 2.5 | First insight | `app/(activation)/insight.tsx` | P0 | audited | Personalized reveal; thin-data honesty |
| 2.6 | Connect last | `app/(activation)/connect.tsx` | P0 | audited | Health Sync primary; Skip first-class |

---

## 3 · Today — morning decision · P0–P1

First viewport = one decision. Sheets below are part of the same composition.

| # | Surface | Route / file | Pri | Status | Why review |
|---|---------|--------------|-----|--------|------------|
| 3.1 | Today home | `app/(app)/(tabs)/today/index.tsx` + `src/features/today/*` | P0 | audited | Hero states, Finish-setup, glances — densest screen |
| 3.2 | Recommendation detail sheet | `RecommendationDetailSheet.tsx` | P0 | audited | Accept / modify / why |
| 3.3 | Refine recommendation sheet | `RefineRecommendationSheet.tsx` | P1 | audited | Modify path |
| 3.4 | Analyze Readiness panel | `AnalyzeReadinessPanel.tsx` | P0 | audited | Empty → generate |
| 3.5 | Wellness overview sheet | `WellnessOverviewSheet.tsx` | P1 | audited | Glance → detail |
| 3.6 | Training load sheet | `TrainingLoadSheet.tsx` | P1 | audited | Form / CTL lite |
| 3.7 | Monthly progress sheet | `MonthlyProgressSheet.tsx` | P2 | audited | Progress narrative |
| 3.8 | Create ad-hoc workout sheet | `CreateAdHocWorkoutSheet.tsx` | P2 | audited | Escape hatch |
| 3.9 | More actions sheet | `more-actions-sheet.tsx` | P2 | audited | Overflow chrome |
| 3.10 | Nutrition glance | `NutritionGlance.tsx` | P1 | audited | Today fueling teaser |
| 3.11 | Upcoming events glance | `UpcomingEventsGlance.tsx` | P2 | audited | → Events hub |
| 3.12 | Week strip / recently teasers | `week-glance-strip.tsx`, `recently-teaser.tsx` | P2 | audited | Density + hierarchy |

---

## 4 · Log — writes · P0–P1

| # | Surface | Route / file | Pri | Status | Why review |
|---|---------|--------------|-----|--------|------------|
| 4.1 | Log tab | `app/(app)/(tabs)/log/index.tsx` | P0 | audited | Wellness + recovery + nutrition entry |
| 4.2 | Wellness check-in sheet | `WellnessCheckinSheet.tsx` | P0 | audited | Daily write; chip density |
| 4.3 | Daily coach check-in | `app/(app)/daily-checkin.tsx` | P1 | audited | Dedicated flow from Today CTA |
| 4.4 | Recovery event | `app/(app)/recovery-event.tsx` | P1 | audited | Journey write |
| 4.5 | Log meal sheet | `LogMealSheet.tsx` | P1 | audited | Quick-log (photo flow already stamped) |
| 4.6 | Hydration quick-add | `HydrationQuickAddSheet.tsx` | P2 | audited | Micro-write |
| 4.7 | Nutrition detail / macro explain | `NutritionDetailSheet.tsx`, `NutritionMacroExplainSheet.tsx` | P2 | audited | Explainability |
| 4.8 | Photo meal route shell | `app/(app)/(tabs)/log/photo-meal.tsx` | P3 | done* | Shell; flow screen stamped |

\*Review only if the route chrome drifts from `PhotoMealFlowScreen`.

---

## 5 · Coach · P0–P1

| # | Surface | Route / file | Pri | Status | Why review |
|---|---------|--------------|-----|--------|------------|
| 5.1 | Coach tab / chat | `app/(app)/(tabs)/coach.tsx` + `CoachChat.tsx` | P0 | audited | Primary conversation surface |
| 5.2 | Room list sheet | `RoomListSheet.tsx` | P1 | audited | Session switcher |
| 5.3 | Dictation / media affordances | `src/features/coach/*` | P1 | audited | Input chrome, tool feedback |

---

## 6 · Session detail · P1

| # | Surface | Route / file | Pri | Status | Why review |
|---|---------|--------------|-----|--------|------------|
| 6.1 | Planned workout detail | `app/(app)/planned/[id].tsx` | P1 | audited | Complete / Skip; structure; fueling |
| 6.2 | Activity detail | `app/(app)/activity/[id].tsx` | P1 | audited | AI analysis, charts, map |
| 6.3 | Activity charts | `ActivityCharts.tsx` + chart children | P1 | audited | Zone ramp; outdoor readability |
| 6.4 | Upcoming planned list | `app/(app)/upcoming/index.tsx` | P2 | audited | Schedule list |
| 6.5 | Recent activity list | `app/(app)/activity/index.tsx` | P2 | audited | History list |

---

## 7 · More hub & account · P1–P2

| # | Surface | Route / file | Pri | Status | Why review |
|---|---------|--------------|-----|--------|------------|
| 7.1 | More home | `app/(app)/(tabs)/more/index.tsx` | P1 | audited | Profile card + menu IA |
| 7.2 | Notification inbox | `app/(app)/(tabs)/more/notifications.tsx` | P1 | audited | Push landing honesty |
| 7.3 | Athlete / Goals / Events | — | — | done | See §0 |
| 7.4 | Sports list | `app/(app)/sports/index.tsx` | P2 | audited | Thresholds lite |
| 7.5 | Sport detail | `app/(app)/sports/[id].tsx` | P2 | audited | Thresholds edit |

---

## 8 · Settings · P2

| # | Surface | Route / file | Pri | Status | Why review |
|---|---------|--------------|-----|--------|------------|
| 8.1 | Settings hub | `…/more/settings/index.tsx` | P2 | audited | Field-companion density |
| 8.2 | Appearance | `…/settings/appearance.tsx` | P2 | audited | System / Light / Dark |
| 8.3 | Notifications prefs | `…/settings/notifications.tsx` | P2 | audited | Channel clarity |
| 8.4 | Units | `…/settings/units.tsx` | P3 | audited | Form chrome |
| 8.5 | Log defaults | `…/settings/log.tsx` | P3 | audited | |
| 8.6 | Coach identity | `…/settings/coach.tsx` | P2 | audited | |
| 8.7 | Nutrition settings | `…/settings/nutrition.tsx` | P1 | audited | Large form; web parity |
| 8.8 | Subscription & Billing | `…/settings/subscription.tsx` | P1 | audited | Store purchase/restore; hosted-only |
| 8.9 | Health Sync | `app/(app)/health-sync.tsx` | P1 | audited | Connect-last sibling; permissions |
| 8.10 | Health workouts / history | `health-workouts.tsx`, `health-history.tsx` | P2 | audited | Sync review lists |
| 8.11 | Connected Apps lite | `app/(app)/connected-apps.tsx` | P1 | audited | Status + web handoff |

---

## 9 · System chrome · P3

| # | Surface | Route / file | Pri | Status | Why review |
|---|---------|--------------|-----|--------|------------|
| 9.1 | Not found | `app/+not-found.tsx` | P3 | audited | Honest dead-end |
| 9.2 | Tab bar | `app/(app)/(tabs)/_layout.tsx` | P3 | audited | Native tabs; badge |
| 9.3 | Measurement sheets | `MeasurementSheet.tsx`, `MeasurementsDetailSheet.tsx` | P3 | audited | Athlete metrics edit |

---

## Suggested review waves

Ordered for maximum athlete-facing impact with minimal Workbench-repeat fatigue.

### Wave A — Store & first impression (do next)

1. **1.1 Login**  
2. **2.2 Consent** → **2.1–2.6 Activation** as one Narrative Workflow chapter  
3. **8.8 Subscription** (if store submission is live)

### Wave B — Daily loop spine

1. **3.1 Today home** (audit first — likely the longest punch list)  
2. **3.2 Recommendation detail** + **3.4 Analyze Readiness**  
3. **4.1 Log tab** + **4.2 Wellness check-in**  
4. **5.1 Coach chat**

### Wave C — Session truth

1. **6.1 Planned detail**  
2. **6.2–6.3 Activity detail + charts**  
3. **6.4–6.5** lists

### Wave D — Account depth

1. **7.1 More** + **7.2 Inbox**  
2. **8.7 Nutrition settings** + **8.9 Health Sync** + **8.11 Connected Apps**  
3. Remaining Settings rows

---

## Constraints (every pass)

- Tokens only via semantic theme (`bg-surface`, `text-text-primary`, brand accents) — no raw zinc/hex in components.
- Field companion, not dashboard: one decision per first viewport.
- Skeletons over full-screen spinners; honest empty/error.
- Dual theme verified (dark reference + light outdoor).
- Shared chrome: `Button`, `AppSymbol`, `SportIcon`, `Skeleton`, `AnimatedPressable`, haptics map in `DESIGN.md`.
- Maestro: if the suite covers the surface, update `testID`s / flows in the same change ([e2e.md](./e2e.md)).

---

## Log

| Date | Action |
|------|--------|
| 2026-07-24 | Catalog created from Expo Router tree + Hallmark stamps + product IA |
| 2026-07-24 | Systematic `hallmark audit` across Waves A–D + stamped regression → [`hallmark-reviews/`](./hallmark-reviews/README.md) |
