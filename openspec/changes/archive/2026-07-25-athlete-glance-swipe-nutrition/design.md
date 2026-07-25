## Context

Athlete already ships a fixed 12-week activity day-circle glance (`ActivityGlanceStrip` + `computeActivityGlance`) with glance-scoped workouts/planned queries. Nutrition list API supports `startDate`/`endDate`. Tracking is gated via `isNutritionTrackingEnabled` (profile), same as Today’s nutrition glance.

## Goals / Non-Goals

**Goals:**

- Horizontal page swipes across 12-week blocks (live page = forward bound).
- Activity | Nutrition segment when tracking is on.
- Nutrition cells: logged vs gap (+ today ring); gap-spotting header.
- Keep activity tap rules; nutrition day tap → Log.

**Non-Goals:**

- Unlimited infinite scroll without a back bound (cap history pages).
- Calorie/TSS intensity, streaks, Today heatmap.
- In-glance meal logging sheet.

## Decisions

### 1. Page model: `pageOffset` in units of 12 weeks

**Choice:** `pageOffset = 0` is the live window (10 weeks back incl. current + 2 forward). `pageOffset = -1` shifts the whole block back 12 weeks. Minimum offset ≈ `-8` (~2 years). Cannot swipe past `0`.

**Why:** Reuses existing week math; predictable fetch windows; avoids open-ended history.

### 2. UI: horizontal `FlatList` paging + segment

**Choice:** Paged `FlatList` (`pagingEnabled`) of offsets; each page renders the grid for its range. Segment above grid switches Activity/Nutrition without resetting page offset.

**Why:** Native swipe feel; TanStack Query caches per-range keys; segment keeps shared time context.

### 3. Nutrition logged definition

**Choice:** A day is logged when the nutrition row for that local date has any of calories/protein/carbs/fat/waterMl &gt; 0 (not `isEmpty`). Hydration-only counts as logged (still “you logged something”).

**Why:** Matches gap-spotting intent; simple binary.

### 4. Nutrition taps → Log

**Choice:** Any nutrition day tap opens the Log tab (`APP_HREFS.log`).

**Why:** Log is the write surface; no per-day nutrition detail route on companion.

### 5. Tracking gate

**Choice:** Nutrition segment hidden when tracking off; Activity-only UI unchanged aside from swipe.

## Risks / Trade-offs

- **[Many pages prefetch]** → `windowSize` / render nearby pages only; query `staleTime` on glance keys.
- **[Nutrition limit]** → request `limit` ≥ days in window (e.g. 100); if capped, partial gaps may look empty — document.
- **[Nested scroll]** → Athlete `ScrollView` + horizontal pager; use nested scroll props / careful hit areas so vertical scroll still works.

## Migration Plan

Ship with Athlete; no migration. Rollback = remove pager/segment, restore fixed activity strip.

## Open Questions

_None for v1._
