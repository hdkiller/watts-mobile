## Context

Mobile already quick-logs nutrition via `GET/POST /api/nutrition` and shows read-only goals from the fueling plan. Web owns deep calibration in `NutritionSettings.vue` via `GET/POST /api/profile/nutrition`, which today uses cookie `getServerSession` only. Product baseline now places Profile → Nutrition field parity in mobile Settings; planning/grocery stay web.

## Goals / Non-Goals

**Goals:**

- Native Settings → Nutrition editor with web field parity for `UserNutritionSettings` + `nutritionTrackingEnabled`.
- Bearer access to `GET/POST /api/profile/nutrition` with `nutrition:read` / `nutrition:write`.
- After save, invalidate nutrition/profile/today so Log and Today reflect recalculated targets.
- Drive hydration quick-add presets from the three saved `quickAddVolumes`.
- Feed macro explain with real settings when available.

**Non-Goals:**

- Weekly meal plans, grocery lists, day regenerate, nutrition chart prefs.
- Danger Zone wipe (`DELETE /api/profile/nutrition`).
- Per-workout fueling strategy override.
- Server-side Pro entitlement gating (web Pro badges are decorative only).

## Decisions

### 1. Bearer via existing nutrition scopes

**Choice:** `requireAuth(event, ['nutrition:read'])` on GET; `nutrition:write` on POST. No new scopes.

**Why:** Matches other nutrition APIs; Official Mobile App already requests these scopes.

**Alternatives:** `profile:write` — wrong domain; settings are nutrition calibration, not core profile metrics.

### 2. Single Settings stack screen, sectioned form

**Choice:** `app/(app)/(tabs)/more/settings/nutrition.tsx` with ScrollView sections matching web card order; sticky/header Save.

**Why:** Matches Settings hub patterns (units, coach, log). One POST of the full payload, same as web.

**Alternatives:** Multi-step wizard — worse for power users editing one field; bottom sheets per section — harder dirty-state/save UX.

### 3. Feature module under `src/features/nutrition/`

**Choice:** `nutritionSettingsApi.ts`, types, `useNutritionSettings.ts`, section components colocated with existing nutrition feature.

**Why:** Shared invalidation with quick-log and explain; avoids a parallel feature silo for one form.

### 4. POST side effects → invalidate, don’t poll

**Choice:** On successful save, invalidate nutrition day queries, athlete profile (`nutritionTrackingEnabled`), and today. Do not wait for all 14 fueling recalcs to finish beyond the HTTP response.

**Why:** Server already recalculates inside POST when tracking is on; client only needs fresh reads.

### 5. Hydration presets = exactly three volumes

**Choice:** HydrationQuickAddSheet uses settings `quickAddVolumes` (length 3). Fallback `250/500/750` while loading or on error. Drop the previous hardcoded fourth `1000` preset when settings are available.

**Why:** Matches server schema (`quickAddVolumes` length 3) and web UI.

### 6. Pro badges decorative

**Choice:** Show optional “Pro” labels on Fuel calibration / Adaptive engine like web; do not block editing.

**Why:** Server does not gate these fields; inventing a gate would diverge from web.

## Risks / Trade-offs

- **[Large form]** → Section cards + sticky Save; reuse existing Switch/TextInput/chip patterns from Sports/Units.
- **[POST latency from 14-day recalc]** → Keep Save in loading state until response; show friendly error on failure; invalidate after success.
- **[Cross-repo Bearer dependency]** → Ship coach-wattz `requireAuth` first or in lockstep; mobile QA blocked until local API accepts Bearer.
- **[Tracking toggle hides Log nutrition]** → Invalidate athlete profile so Log/Today gates update immediately.

## Migration Plan

- No data migration. Existing settings rows load via GET.
- Rollback: remove native screen/hub row; athletes still use Open Profile Settings.
- DELETE wipe remains web-only (session Danger Zone).

## Open Questions

None for v1 of this change. Store pricing / Pro hard-gating of fuel calibration is out of scope unless product later decides to diverge from web.
