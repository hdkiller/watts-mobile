import { en, type MessageKey } from './messages/en';

/** Resolve a message key. English-only for v1; swap catalog when locales land. */
export function t(key: MessageKey): string {
  return en[key];
}
