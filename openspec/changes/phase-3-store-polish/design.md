## Context

Companion needs store-candidate chrome after functional tabs ship. Branding follows coach-wattz BRANDING.md. E2E is explicitly deferred. EAS channels were noted as later in Phase 0.

## Goals / Non-Goals

**Goals:**
- Brand-complete icon/splash/name
- Privacy and health-data questionnaire strings ready for store forms
- More tab as account glue: instance, notifications entry, open web, sign out
- Sensible i18n footing (English-first acceptable)
- Sentry usable on release builds without leaking secrets

**Non-Goals:**
- Maestro/Detox E2E
- Phase 4 HealthKit / Health Connect
- Separate branded binaries per self-hosted customer (open question #4 — single binary + instance picker for now)

## Decisions

1. **Single binary + instance picker** remains the distribution model unless product flips open question #4.
2. **Assets** live in `assets/`; configure via `app.json` / `app.config.ts`.
3. **Privacy copy** maintained in `docs/` or store metadata folder as checklist — not hard-coded into obscure UI only.
4. **i18n** — wire a minimal i18n helper if Tolgee/shared locales are easy; else English strings with keys ready to extract.
5. **Notification prefs** — deep-link or open web for rich prefs if mobile API lacks granular toggles; local OS permission CTA stays in-app.

## Risks / Trade-offs

- [Store rejection on health claims] → Keep copy accurate; no medical claims.
- [EAS secrets mishandling] → Document env vars; never commit DSN tokens that are meant private if policy requires (public DSN is OK for Sentry client).

## Open Questions

- Final store listing screenshots owner (marketing vs eng)
- Whether notification preference toggles exist on API or web-only for v1
