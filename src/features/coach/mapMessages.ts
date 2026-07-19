import {
  ACTIVE_TURN_STATUSES,
  TERMINAL_TURN_STATUSES,
  type CoachUIMessage,
  type StoredChatMessage,
} from './types';

export function isActiveTurnStatus(status: string | null | undefined): boolean {
  return ACTIVE_TURN_STATUSES.includes(status as (typeof ACTIVE_TURN_STATUSES)[number]);
}

export function isTerminalTurnStatus(status: string | null | undefined): boolean {
  return TERMINAL_TURN_STATUSES.includes(status as (typeof TERMINAL_TURN_STATUSES)[number]);
}

export function messageText(message: CoachUIMessage | StoredChatMessage | null | undefined): string {
  if (!message) return '';
  if (typeof message.content === 'string' && message.content.trim()) {
    return message.content;
  }
  const parts = Array.isArray(message.parts) ? message.parts : [];
  return parts
    .map((part) => {
      if (part && typeof part === 'object' && 'type' in part && part.type === 'text') {
        const text = (part as { text?: unknown }).text;
        return typeof text === 'string' ? text : '';
      }
      return '';
    })
    .join('');
}

export function transformStoredMessage(msg: StoredChatMessage): CoachUIMessage {
  const textParts: CoachUIMessage['parts'] = [];
  if (Array.isArray(msg.parts)) {
    for (const part of msg.parts) {
      if (part?.type === 'text' && typeof part.text === 'string') {
        textParts.push({ type: 'text', text: part.text });
      }
    }
  }
  if (textParts.length === 0 && msg.content) {
    textParts.push({ type: 'text', text: msg.content });
  }

  const role: CoachUIMessage['role'] =
    msg.role === 'assistant' || msg.role === 'system' ? msg.role : 'user';

  return {
    id: msg.id,
    role,
    content: msg.content,
    parts: textParts,
    createdAt: new Date(msg.createdAt || msg.metadata?.createdAt || Date.now()),
    updatedAt: msg.updatedAt || msg.metadata?.updatedAt || null,
    metadata: { ...(msg.metadata || {}) },
  };
}

/** Keep user/assistant rows for `useChat`; drop tool/system noise in v1. */
export function hydrateCoachMessages(stored: StoredChatMessage[]): CoachUIMessage[] {
  return stored
    .filter((msg) => msg.role === 'user' || msg.role === 'assistant')
    .map(transformStoredMessage);
}

export function getLatestAssistantMessage(
  messages: CoachUIMessage[],
  options: { includeHidden?: boolean } = {}
): CoachUIMessage | undefined {
  return [...messages]
    .reverse()
    .find(
      (message) =>
        message?.role === 'assistant' &&
        !message?.metadata?.syntheticTyping &&
        (options.includeHidden !== false || !shouldHideAssistantBubble(message))
    );
}

export function shouldHideAssistantBubble(message: CoachUIMessage): boolean {
  if (message.metadata?.hiddenBecauseEmptyFailure) return true;
  if (message.metadata?.hideUntilContent && !messageText(message).trim()) return true;
  return false;
}

export function hasActiveTurn(messages: CoachUIMessage[]): boolean {
  return isActiveTurnStatus(
    getLatestAssistantMessage(messages, { includeHidden: true })?.metadata?.turnStatus
  );
}

export function mergeRealtimeMessage(
  existingMessage: CoachUIMessage,
  incomingMessage: CoachUIMessage
): CoachUIMessage {
  const existingStatus = existingMessage?.metadata?.turnStatus;
  const incomingStatus = incomingMessage?.metadata?.turnStatus;
  const existingParts = Array.isArray(existingMessage?.parts) ? existingMessage.parts : [];
  const incomingParts = Array.isArray(incomingMessage?.parts) ? incomingMessage.parts : [];
  const existingNonTextParts = existingParts.filter((part) => part?.type !== 'text');
  const incomingHasNonTextParts = incomingParts.some((part) => part?.type !== 'text');

  let nextIncoming = incomingMessage;

  if (!incomingHasNonTextParts && existingNonTextParts.length > 0) {
    const incomingTextPart = incomingParts.find((part) => part?.type === 'text');
    nextIncoming = {
      ...incomingMessage,
      parts: [
        ...existingNonTextParts,
        ...(incomingTextPart
          ? [incomingTextPart]
          : typeof incomingMessage?.content === 'string'
            ? [{ type: 'text' as const, text: incomingMessage.content }]
            : []),
      ],
      metadata: {
        ...(existingMessage?.metadata || {}),
        ...(incomingMessage?.metadata || {}),
      },
    };
  }

  if (isTerminalTurnStatus(existingStatus) && isActiveTurnStatus(incomingStatus)) {
    return {
      ...nextIncoming,
      content:
        typeof existingMessage?.content === 'string' && existingMessage.content.trim()
          ? existingMessage.content
          : nextIncoming.content,
      parts:
        Array.isArray(existingMessage?.parts) && existingMessage.parts.length > 0
          ? existingMessage.parts
          : nextIncoming.parts,
      metadata: {
        ...(nextIncoming?.metadata || {}),
        ...(existingMessage?.metadata || {}),
        turnStatus: existingStatus,
      },
    };
  }

  const existingText =
    typeof existingMessage?.content === 'string' ? existingMessage.content.trim() : '';
  const incomingText =
    typeof nextIncoming?.content === 'string' ? nextIncoming.content.trim() : '';
  const existingIsStreaming =
    isActiveTurnStatus(String(existingStatus || '')) ||
    Boolean(existingMessage?.metadata?.isRealtimeDraft);

  if (
    existingIsStreaming &&
    existingText.length > incomingText.length &&
    nextIncoming?.role === 'assistant'
  ) {
    const existingTextPart = existingParts.find((part) => part?.type === 'text');
    return {
      ...nextIncoming,
      content: existingMessage.content,
      parts: [
        ...existingNonTextParts,
        existingTextPart || { type: 'text' as const, text: String(existingMessage.content || '') },
      ],
      metadata: {
        ...(nextIncoming?.metadata || {}),
        ...(existingMessage?.metadata || {}),
        turnStatus: existingStatus || incomingStatus,
      },
    };
  }

  return nextIncoming;
}

export function mergeLoadedMessages(
  existingMessages: CoachUIMessage[],
  loadedMessages: CoachUIMessage[]
): CoachUIMessage[] {
  const existingById = new Map(existingMessages.map((message) => [message?.id, message]));

  return loadedMessages.map((loadedMessage) => {
    const existingMessage = existingById.get(loadedMessage?.id);
    if (!existingMessage) return loadedMessage;
    return mergeRealtimeMessage(existingMessage, loadedMessage);
  });
}

export function applyAssistantTextDelta(
  messages: CoachUIMessage[],
  event: {
    messageId: string;
    turnId: string;
    textDelta: string;
    status?: string;
  }
): CoachUIMessage[] {
  if (!event.textDelta) return messages;

  const existingIndex = messages.findIndex((entry) => entry?.id === event.messageId);

  if (existingIndex >= 0) {
    const existingMessage = messages[existingIndex];
    const existingParts = Array.isArray(existingMessage?.parts) ? existingMessage.parts : [];
    const nonTextParts = existingParts.filter((part) => part?.type !== 'text');
    const nextText = `${typeof existingMessage?.content === 'string' ? existingMessage.content : ''}${event.textDelta}`;
    const nextMessages = [...messages];
    nextMessages[existingIndex] = {
      ...existingMessage,
      content: nextText,
      parts: [...nonTextParts, { type: 'text' as const, text: nextText }],
      metadata: {
        ...(existingMessage?.metadata || {}),
        turnId: event.turnId,
        turnStatus: event.status || 'STREAMING',
      },
    };
    return nextMessages;
  }

  return [
    ...messages,
    {
      id: event.messageId,
      role: 'assistant',
      content: event.textDelta,
      parts: [{ type: 'text' as const, text: event.textDelta }],
      createdAt: new Date(),
      metadata: {
        turnId: event.turnId,
        turnStatus: event.status || 'STREAMING',
        isDraft: true,
        isRealtimeDraft: true,
      },
    },
  ];
}

export function upsertChatMessage(
  messages: CoachUIMessage[],
  message: StoredChatMessage
): CoachUIMessage[] {
  if (message.role !== 'user' && message.role !== 'assistant') {
    return messages;
  }
  const transformed = transformStoredMessage(message);
  const existingIndex = messages.findIndex((entry) => entry?.id === transformed.id);

  if (existingIndex >= 0) {
    const next = [...messages];
    next[existingIndex] = mergeRealtimeMessage(messages[existingIndex], transformed);
    return next;
  }

  return [...messages, transformed].sort(
    (left, right) =>
      new Date(left.createdAt || 0).getTime() - new Date(right.createdAt || 0).getTime()
  );
}

export function visibleCoachMessages(messages: CoachUIMessage[]): CoachUIMessage[] {
  return messages.filter((message) => {
    if (message.role !== 'user' && message.role !== 'assistant') return false;
    if (message.role === 'assistant' && shouldHideAssistantBubble(message)) return false;
    return true;
  });
}
