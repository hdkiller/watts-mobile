import { describe, expect, it } from 'vitest';

import {
  applyAssistantTextDelta,
  extractPendingApprovals,
  hasActiveTurn,
  humanizeToolName,
  hydrateCoachMessages,
  mergeLoadedMessages,
  messageImageParts,
  messageText,
  nutritionToolSummaries,
  toolOutcomeSummaries,
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

  it('preserves image file parts and synthesizes tool approvals', () => {
    const message = transformStoredMessage({
      id: 'a1',
      role: 'assistant',
      content: 'Looks like oatmeal',
      parts: [
        { type: 'text', text: 'Looks like oatmeal' },
        {
          type: 'file',
          url: 'https://example.com/meal.jpg',
          mediaType: 'image/jpeg',
          filename: 'meal.jpg',
        },
      ],
      metadata: {
        pendingApprovals: [
          { toolCallId: 'call-1', toolName: 'log_nutrition_meal', args: { name: 'Oatmeal' } },
        ],
      },
    });

    expect(messageImageParts(message)).toHaveLength(1);
    expect(extractPendingApprovals(message)[0]?.toolCallId).toBe('call-1');
  });

  it('summarizes completed nutrition tool parts', () => {
    const message: CoachUIMessage = {
      id: 'a2',
      role: 'assistant',
      parts: [
        {
          type: 'tool-log_nutrition_meal',
          state: 'output-available',
          toolCallId: 'call-2',
          output: { ok: true },
        } as unknown as CoachUIMessage['parts'][number],
      ],
    };
    expect(nutritionToolSummaries(message)[0]).toMatch(/Meal logged/i);
    expect(toolOutcomeSummaries(message)[0]?.status).toBe('success');
  });

  it('summarizes recovery and wellness tool successes', () => {
    const message: CoachUIMessage = {
      id: 'a3',
      role: 'assistant',
      parts: [
        {
          type: 'tool-record_wellness_event',
          state: 'output-available',
          toolCallId: 'call-3',
          output: { ok: true },
        } as unknown as CoachUIMessage['parts'][number],
        {
          type: 'tool-get_wellness_metrics',
          state: 'result',
          toolCallId: 'call-4',
          result: { count: 1 },
        } as unknown as CoachUIMessage['parts'][number],
      ],
    };
    const outcomes = toolOutcomeSummaries(message);
    expect(outcomes.find((o) => o.toolName === 'record_wellness_event')?.message).toMatch(
      /Recovery event logged/i
    );
    expect(outcomes.find((o) => o.toolName === 'get_wellness_metrics')?.message).toMatch(
      /recovery metrics/i
    );
  });

  it('uses a generic success fallback for unknown tools', () => {
    const message: CoachUIMessage = {
      id: 'a4',
      role: 'assistant',
      parts: [
        {
          type: 'tool-create_planned_workout',
          state: 'output-available',
          toolCallId: 'call-5',
          output: { id: 'pw-1' },
        } as unknown as CoachUIMessage['parts'][number],
      ],
    };
    const outcome = toolOutcomeSummaries(message)[0];
    expect(outcome?.status).toBe('success');
    expect(outcome?.message).toMatch(/Coach updated Create Planned Workout/i);
    expect(humanizeToolName('create_planned_workout')).toBe('Create Planned Workout');
  });

  it('surfaces failed and denied tool states', () => {
    const message: CoachUIMessage = {
      id: 'a5',
      role: 'assistant',
      parts: [
        {
          type: 'tool-log_nutrition_meal',
          state: 'output-error',
          toolCallId: 'call-6',
          errorText: 'quota',
        } as unknown as CoachUIMessage['parts'][number],
        {
          type: 'tool-record_wellness_event',
          state: 'output-denied',
          toolCallId: 'call-7',
        } as unknown as CoachUIMessage['parts'][number],
      ],
    };
    const outcomes = toolOutcomeSummaries(message);
    expect(outcomes.find((o) => o.toolName === 'log_nutrition_meal')).toMatchObject({
      status: 'failure',
      message: expect.stringMatching(/Couldn't complete/i),
    });
    expect(outcomes.find((o) => o.toolName === 'record_wellness_event')).toMatchObject({
      status: 'denied',
      message: expect.stringMatching(/was not applied/i),
    });
  });
});
