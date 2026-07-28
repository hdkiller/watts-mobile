/**
 * i18n scaffold & message resolution for Coach Watts Mobile.
 *
 * Localization Policy (v1):
 * - Client chrome is English-first; UI strings use typed keys in `messages/en.ts`.
 * - Server-driven content (Coach chat, AI summaries, workout step titles/cues) is
 *   localized by the coach-wattz backend based on athlete profile preferences.
 * - `t()` resolves keys against `messages/en.ts` as a typed scaffold, enabling
 *   future translation catalog extraction (e.g. Tolgee or shared web locales).
 */
export { t } from './t';
export type { MessageKey } from './messages/en';
