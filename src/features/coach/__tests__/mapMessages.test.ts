import { describe, expect, it } from 'vitest';

import {
  applyAssistantTextDelta,
  hasActiveTurn,
  hydrateCoachMessages,
  mergeLoadedMessages,
  messageText,
  transformStoredMessage,
} from '../mapMessages';
import type { CoachUIMessage } from '../types';

describe('mapMessages', () => {
  it('hydrates user/assistant messages and drops tool rows', () => {
    const hydrated = hydrateCoachMessages([
      {
        id: 'u1',
        role: 'user',
        content: 'Hello',
        createdAt: '2026-07-19T10:00:00.000Z',
      },
      {
        id: 't1',
        role: 'tool',
        content: 'tool output',
        createdAt: '2026-07-19T10:00:01.000Z',
      },
      {
        id: 'a1',
        role: 'assistant',
        content: 'Hi there',
        parts: [{ type: 'text', text: 'Hi there' }],
        metadata: { turnStatus: 'COMPLETED', turnId: 'turn-1' },
        createdAt: '2026-07-19T10:00:02.000Z',
      },
    ]);

    expect(hydrated).toHaveLength(2);
    expect(hydrated[0]?.role).toBe('user');
    expect(messageText(hydrated[1])).toBe('Hi there');
  });

  it('applies assistant text deltas without losing prior text', () => {
    const initial: CoachUIMessage[] = [
      {
        id: 'a1',
        role: 'assistant',
        content: 'Hello',
        parts: [{ type: 'text', text: 'Hello' }],
        metadata: { turnId: 'turn-1', turnStatus: 'STREAMING' },
      },
    ];

    const next = applyAssistantTextDelta(initial, {
      messageId: 'a1',
      turnId: 'turn-1',
      textDelta: ' world',
      status: 'STREAMING',
    });

    expect(messageText(next[0])).toBe('Hello world');
    expect(hasActiveTurn(next)).toBe(true);
  });

  it('does not regress terminal turn status when merging a stale active upsert', () => {
    const existing = transformStoredMessage({
      id: 'a1',
      role: 'assistant',
      content: 'Done',
      metadata: { turnId: 'turn-1', turnStatus: 'COMPLETED' },
    });
    const incoming = transformStoredMessage({
      id: 'a1',
      role: 'assistant',
      content: 'Done',
      metadata: { turnId: 'turn-1', turnStatus: 'STREAMING' },
    });

    const merged = mergeLoadedMessages([existing], [incoming]);
    expect(merged[0]?.metadata?.turnStatus).toBe('COMPLETED');
  });
});
