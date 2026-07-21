## Context

Today Health Sync only grants read permission and prefills sleep/weight into the Log check-in form. Nothing is uploaded until the athlete taps Save. Coach Watts already accepts rich wellness via `POST /api/wellness` and workouts via `POST /api/workouts/upload-fit`; web wearables (Garmin, Whoop, Oura, …) already populate the same tables. Product decision for this change: **opt-in**, sync **all sensible objective metrics**, **always push** (backend owns merge), and run **auto + background** sync with a **Settings ledger** for history / per-item retry (wellness days and workouts).

## Goals / Non-Goals

**Goals:**

- Opt-in Health Connect (Android) + HealthKit (iOS) ingest for daily wellness aggregates.
- Auto sync on foreground + best-effort background sync when enabled.
- Workout session discovery → FIT upload → per-session ledger status.
- Settings → Health Sync history: what was sent, when, status, retry / force sync.
- Client always POSTs mapped data; coach-wattz decides how to merge with other sources.
- Update privacy copy for real upload (not prefill-only).

**Non-Goals:**

- Client-side skip/merge when Whoop/Garmin already has the day.
- Subjective mood/stress/fatigue/soreness from health platforms.
- Continuous HR / ECG / clinical claims.
- Writing samples or workouts back into HealthKit / Health Connect.
- Replacing web Connected Apps OAuth.
- Perfect iOS background delivery guarantees (best-effort only).
- Building a new coach-wattz mobile-only health API (reuse existing contracts).

## Decisions

### D1 — Layered client architecture

```
UI (Health Sync + History)
        │
SyncOrchestrator ──► WellnessUploader ──► POST /api/wellness
        │
        └──────────► WorkoutUploader ──► POST /api/workouts/upload-fit
        │
   SyncLedger (MMKV/SQLite)
        │
 PlatformReader (HC | HK)
```

- **Readers** are platform-thin: query since watermark → shared DTOs.
- **Mapper** converts to Coach Watts wellness / FIT payloads + `rawJson` provenance (`platform`, sample ids, units).
- **Orchestrator** owns enablement gate, triggers, concurrency (single-flight), and ledger updates.
- **Ledger** is source of truth for Settings history and retry.

Alternatives considered: fold into `features/log` (rejected — sync is not Log UX); server-pull of health data (impossible — OS keeps samples on-device).

### D2 — Opt-in defaults

- Permissions may already be granted for Log prefill; **auto sync stays OFF** until the athlete enables “Sync to Coach Watts” on the Health Sync screen.
- Enabling sync requests any missing read types for the v1 metric set + workout types.
- Disabling sync stops scheduling and uploads; ledger history is retained locally unless the athlete clears it / signs out (policy: retain until sign-out or explicit clear).

### D3 — Wellness metric set (v1)

Push when the platform has a value for the local calendar day (or last-night sleep window):

| Metric | API fields |
|--------|------------|
| Sleep duration + stages | `sleepSecs` / `sleepHours`, `sleepDeepSecs`, `sleepRemSecs`, `sleepLightSecs`, `sleepAwakeSecs` |
| Resting HR | `restingHr` |
| HRV | `hrv` (RMSSD-like) and/or `hrvSdnn` (map by platform) |
| Weight | `weight` (kg) |
| Body fat | `bodyFat` |
| SpO₂ | `spO2` |
| Respiration | `respiration` |
| VO₂ max | `vo2max` |
| Calories (if available) | `restingCaloriesBurned` / `activeCaloriesBurned` / `totalCaloriesBurned` |

Reuse existing sleep interval merge/dedupe from Log prefill. Omit fields with no sample. Always include `date` + `rawJson` with platform provenance.

### D4 — Always push; backend sorts conflicts

- Client does **not** read “does Whoop already own today?” before POSTing.
- Idempotent upsert-by-date remains the server contract.
- `rawJson` MUST include `source: "health_connect" | "healthkit"` and enough ids to reprocess.
- **coach-wattz follow-up (tracked):** strengthen `lastSource` / field-level merge so mobile pushes don’t thrash wearable-quality fields. Mobile ships even if backend merge is naïve initially.

### D5 — Triggers

| Trigger | When |
|---------|------|
| Foreground | App becomes active and sync enabled + authenticated |
| Manual | “Sync now” / per-item Retry in Settings |
| Background | Register platform BG task when sync enabled; unregister when disabled |

Background is best-effort. Android: Health Connect change notifications and/or periodic work. iOS: BGAppRefresh / HealthKit observer queries where entitlement + OS allow. Failures land in ledger as `failed` for retry.

### D6 — Sync ledger model

Local store (prefer MMKV JSON list or small SQLite table — match repo patterns; offline wellness queue is AsyncStorage today; for queryable history prefer MMKV with indexed keys or SQLite if volume grows).

Per item:

```ts
type SyncLedgerItem = {
  id: string;                 // stable: wellness:YYYY-MM-DD | workout:<platformSessionId>
  kind: 'wellness' | 'workout';
  platform: 'health_connect' | 'healthkit';
  title: string;              // e.g. "Wellness · Jul 20" / "Run · 42 min"
  localDate?: string;         // wellness
  startedAt?: string;         // workout ISO
  status: 'pending' | 'syncing' | 'synced' | 'failed' | 'needs_sync';
  lastAttemptAt?: string;
  lastSuccessAt?: string;
  lastError?: string;         // short, non-PII
  remoteWorkoutId?: string;   // when known after upload / match
  attemptCount: number;
};
```

- Cap retained history (e.g. last 90 days wellness + last ~100 workouts) with oldest eviction.
- Settings history lists newest first; filter chips: All / Failed / Needs sync.
- Retry sets status → `pending`/`syncing` and re-runs uploader for that id only.

### D7 — Workout presence / gap detection

1. Reader lists recent exercise sessions (lookback window, e.g. 14–30 days).
2. For each session, ensure a ledger row exists (`needs_sync` if never uploaded).
3. Presence check against Coach Watts: query recent workouts (`GET /api/workouts` with date range) and match heuristically by start time ± tolerance + duration/sport when available.
4. If matched → mark `synced` + store `remoteWorkoutId` (no re-upload).
5. If not matched and not successfully uploaded → `needs_sync` / `failed` after attempt.
6. Upload path: build FIT from available samples (session summary minimum; streams when readable) → `POST /api/workouts/upload-fit` with metadata JSON (`platform`, `platformSessionId`, times).

Alternatives: JSON activity create endpoint (doesn’t exist as documented third-party path); skip FIT and only sync summaries (rejected — analysis pipeline expects FIT).

**Phasing inside implementation:** ship wellness sync + ledger UI first; workout reader/FIT/upload as immediate follow-on tasks in the same change (not a separate proposal). Workouts are gated by a **Sync workouts** sub-toggle under the master Sync to Coach Watts control (see D8).

### D8 — Settings UX

Health Sync screen sections:

1. Connection status (existing).
2. **Sync to Coach Watts** master toggle (opt-in) — enables wellness sync + last successful sync timestamp.
3. **Sync workouts** sub-toggle — visible when master is ON; default **ON** when master is first enabled; athlete can turn workouts off while keeping wellness sync. When master is OFF, workouts sync is inactive regardless of sub-toggle.
4. Metric summary (which permission types granted).
5. **Sync history** → dedicated screen with per-item rows, status badges, Retry, Sync now (history may still show past workout items when workouts sub-toggle is off).
6. Disconnect / open system settings (existing).

Honest empty states when sync off or no items yet.

### D9 — Privacy & analytics

- No health metric values in Sentry breadcrumbs/analytics events (status enums + counts only).
- Update `docs/store-privacy-checklist.md` and in-app copy: when enabled, samples are uploaded to the athlete’s instance.
- Still no write-back to Apple Health / Health Connect.

### D10 — Native modules / rebuild

Adding background task packages or expanding HealthKit entitlements requires **dev client / EAS rebuild** per `docs/native-modules.md`. Document in tasks and release notes.

## Risks / Trade-offs

- **[Risk] Backend merge thrash** (mobile overwrites Whoop) → Mitigation: always send `rawJson` provenance; open coach-wattz follow-up for source-aware merge; product accepts temporary overwrite.
- **[Risk] iOS background unreliable** → Mitigation: foreground sync primary; ledger + Retry; don’t promise real-time.
- **[Risk] Duplicate workouts** (Garmin + Health) → Mitigation: presence match before upload; backend dedupe if same FIT fingerprint later; document known limitation.
- **[Risk] FIT builder complexity** → Mitigation: v1 summary FIT (session + basic records); enrich streams in a fast follow-up if needed.
- **[Risk] HRV unit mismatch (RMSSD vs SDNN)** → Mitigation: map to `hrv` vs `hrvSdnn` explicitly; never silently mix.
- **[Risk] Battery / Play policy for background** → Mitigation: infrequent periodic + change-triggered; respect OS quotas; sync only when enabled.
- **[Risk] Large ledger / PII** → Mitigation: store summaries not raw sample blobs; cap retention; clear on sign-out.

## Migration Plan

1. Ship with sync **default OFF**; existing prefill users unchanged.
2. On first open of Health Sync after update, show short explainer + enable CTA.
3. Rebuild binaries after native dependency/plugin changes.
4. Update store privacy checklist before the first store build that includes upload.
5. Rollback: remote feature flag optional later; simplest rollback is “disable sync toggle” + app release that ignores background tasks.

## Open Questions

1. ~~coach-wattz lastSource~~ **Confirmed:** upsert stamps `lastSource` as `oauth:<appId>` (not body-controlled). Mobile puts `healthkit` / `health_connect` in `rawJson`; backend follow-up tracked as [issues/063](../../../../docs/issues/063.md).
2. **Workout match quality:** v1 uses start-time ±5 min + duration score against `GET /api/workouts`; FIT metadata carries `platformSessionId` for future stronger dedupe.
3. ~~Lookback defaults~~ **Decided:** **14 days**.
4. ~~Single vs split toggles~~ **Decided:** master **Sync to Coach Watts** + **Sync workouts** sub-toggle (default ON when master is first enabled).
