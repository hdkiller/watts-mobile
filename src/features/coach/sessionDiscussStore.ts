export type SessionDiscussKind = 'planned' | 'activity';

export type SessionDiscussContext = {
  kind: SessionDiscussKind;
  id: string;
  title: string;
  type?: string | null;
  date?: string | null;
  /** Short KPI line, e.g. "45 min · TSS 62". */
  metricsLine?: string | null;
  /** Optional adherence snippet for completed activities. */
  adherenceLine?: string | null;
};

let pending: SessionDiscussContext | null = null;

/** Stage session context for the next Coach discuss handoff. */
export function setSessionDiscuss(context: SessionDiscussContext): void {
  pending = context;
}

/** Consume staged session context (one-shot). */
export function takeSessionDiscuss(): SessionDiscussContext | null {
  const value = pending;
  pending = null;
  return value;
}

/** Test helper — clear without consuming. */
export function clearSessionDiscuss(): void {
  pending = null;
}
