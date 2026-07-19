## Context

Product baseline Log screen is form-first. coach-wattz already exposes:

| Endpoint | Auth | Use |
|----------|------|-----|
| `POST /api/wellness` | Bearer `health:write` | Primary save path for sleep/feel/weight/notes |
| `GET /api/wellness` | Bearer `health:read` | Prefill today’s row if present |
| `GET /api/checkin/today` | Bearer `health:read` | Optional AI check-in status |
| `POST /api/checkin/answer` | Bearer `health:write` (fixed) | Future YES/NO answers — not required for v1 Log form |

## Goals / Non-Goals

**Goals:** Save a day’s wellness check-in from the Log tab in under a minute.

**Non-Goals:** Full AI questionnaire UX, offline queue (soft note only), notifications.

## Decisions

### 1. Wellness POST as source of truth for v1 Log

Map form fields → wellness payload:

| Form | Wellness field |
|------|----------------|
| Sleep hours | `sleepHours` |
| Sleep quality (1–5 or 1–10) | `sleepQuality` |
| Feel / readiness (1–10) | `readiness` |
| Notes | `comments` |
| Weight (optional) | `weight` |
| Date | local `YYYY-MM-DD` |

### 2. Prefill from today’s wellness list

`GET /api/wellness?limit=1` or date filter if supported; otherwise leave blanks.

### 3. Success UX

Toast/inline success → optional “Back to Today” button using router.

## Risks

| Risk | Mitigation |
|------|------------|
| Wellness GET shape varies | Defensive parse; empty form on failure |
| Duplicate same-day upserts | Rely on server upsert semantics |
