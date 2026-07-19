import {
  ACTIVE_TURN_STATUSES,
  NUTRITION_TOOL_NAMES,
  RECOVERY_TOOL_NAMES,
  TERMINAL_TURN_STATUSES,
  WELLNESS_TOOL_NAMES,
  type CoachUIMessage,
  type PendingChatApproval,
  type StoredChatMessage,
  type ToolOutcomeStatus,
  type ToolOutcomeSummary,
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

export function messageImageParts(
  message: CoachUIMessage | StoredChatMessage | null | undefined
): Array<{ url: string; mediaType?: string; filename?: string }> {
  const parts = Array.isArray(message?.parts) ? message.parts : [];
  const images: Array<{ url: string; mediaType?: string; filename?: string }> = [];
  for (const part of parts) {
    if (!part || typeof part !== 'object') continue;
    const typed = part as {
      type?: string;
      url?: string;
      mediaType?: string;
      filename?: string;
    };
    if (typed.type !== 'file' || !typed.url) continue;
    const mediaType = typed.mediaType || '';
    if (mediaType.startsWith('image/') || /\.(jpe?g|png|gif|webp|heic|heif)$/i.test(typed.url)) {
      images.push({
        url: typed.url,
        mediaType: typed.mediaType,
        filename: typed.filename,
      });
    }
  }
  return images;
}

function synthesizeApprovalParts(
  existingParts: CoachUIMessage['parts'],
  pendingApprovals: PendingChatApproval[] | undefined
): CoachUIMessage['parts'] {
  if (!pendingApprovals?.length) return existingParts;
  const parts = Array.isArray(existingParts) ? [...existingParts] : [];
  const existingIds = new Set(
    parts
      .map((part) => {
        if (!part || typeof part !== 'object') return null;
        const typed = part as {
          type?: string;
          approvalId?: string;
          toolCallId?: string;
          approval?: { id?: string };
          state?: string;
        };
        if (
          typed.type === 'tool-approval-request' ||
          (typeof typed.type === 'string' &&
            typed.type.startsWith('tool-') &&
            typed.state === 'approval-requested')
        ) {
          return typed.approvalId || typed.approval?.id || typed.toolCallId || null;
        }
        return null;
      })
      .filter(Boolean)
  );

  for (const approval of pendingApprovals) {
    if (!approval?.toolCallId || existingIds.has(approval.toolCallId)) continue;
    parts.push({
      type: 'tool-approval-request',
      approvalId: approval.toolCallId,
      toolCall: {
        toolName: approval.toolName,
        args: approval.args,
      },
    } as unknown as CoachUIMessage['parts'][number]);
  }
  return parts;
}

export function transformStoredMessage(msg: StoredChatMessage): CoachUIMessage {
  const keptParts: CoachUIMessage['parts'] = [];
  if (Array.isArray(msg.parts)) {
    for (const part of msg.parts) {
      if (!part?.type) continue;
      if (part.type === 'text' && typeof part.text === 'string') {
        keptParts.push({ type: 'text', text: part.text });
        continue;
      }
      if (part.type === 'file' && typeof (part as { url?: unknown }).url === 'string') {
        keptParts.push(part as CoachUIMessage['parts'][number]);
        continue;
      }
      if (
        part.type === 'tool-approval-request' ||
        (typeof part.type === 'string' && part.type.startsWith('tool-'))
      ) {
        keptParts.push(part as CoachUIMessage['parts'][number]);
      }
    }
  }
  if (keptParts.length === 0 && msg.content) {
    keptParts.push({ type: 'text', text: msg.content });
  }

  const parts = synthesizeApprovalParts(
    keptParts,
    msg.metadata?.pendingApprovals as PendingChatApproval[] | undefined
  );

  const role: CoachUIMessage['role'] =
    msg.role === 'assistant' || msg.role === 'system' ? msg.role : 'user';

  return {
    id: msg.id,
    role,
    content: msg.content,
    parts,
    createdAt: new Date(msg.createdAt || msg.metadata?.createdAt || Date.now()),
    updatedAt: msg.updatedAt || msg.metadata?.updatedAt || null,
    metadata: { ...(msg.metadata || {}) },
  };
}

/** Keep user/assistant rows for `useChat`; drop tool/system noise except via synthesized parts. */
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
  const hasImages = messageImageParts(message).length > 0;
  const hasApprovals = extractPendingApprovals(message).length > 0;
  const hasToolOutcomes = toolOutcomeSummaries(message).length > 0;
  if (
    message.metadata?.hideUntilContent &&
    !messageText(message).trim() &&
    !hasImages &&
    !hasApprovals &&
    !hasToolOutcomes
  ) {
    return true;
  }
  return false;
}

export function hasActiveTurn(messages: CoachUIMessage[]): boolean {
  return isActiveTurnStatus(
    getLatestAssistantMessage(messages, { includeHidden: true })?.metadata?.turnStatus
  );
}

export function extractPendingApprovals(message: CoachUIMessage): PendingChatApproval[] {
  const fromMeta = Array.isArray(message.metadata?.pendingApprovals)
    ? (message.metadata.pendingApprovals as PendingChatApproval[])
    : [];
  const fromParts: PendingChatApproval[] = [];
  for (const part of message.parts || []) {
    if (!part || typeof part !== 'object') continue;
    const typed = part as {
      type?: string;
      approvalId?: string;
      toolCallId?: string;
      state?: string;
      toolCall?: { toolName?: string; args?: unknown };
      approval?: { id?: string };
      input?: unknown;
    };
    if (typed.type === 'tool-approval-request' && typed.approvalId) {
      fromParts.push({
        toolCallId: typed.approvalId,
        toolName: typed.toolCall?.toolName || 'tool',
        args: typed.toolCall?.args,
      });
      continue;
    }
    if (
      typeof typed.type === 'string' &&
      typed.type.startsWith('tool-') &&
      typed.state === 'approval-requested'
    ) {
      const id = typed.approval?.id || typed.toolCallId;
      if (!id) continue;
      fromParts.push({
        toolCallId: id,
        toolName: typed.type.replace(/^tool-/, '') || 'tool',
        args: typed.input,
      });
    }
  }

  const byId = new Map<string, PendingChatApproval>();
  for (const item of [...fromMeta, ...fromParts]) {
    if (item?.toolCallId) byId.set(item.toolCallId, item);
  }
  return [...byId.values()];
}

export function humanizeToolName(toolName: string): string {
  return toolName
    .replace(/^tool-/, '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function resolveToolPartName(part: {
  type?: string;
  toolName?: string;
}): string | null {
  if (typeof part.toolName === 'string' && part.toolName.trim()) return part.toolName;
  if (typeof part.type === 'string' && part.type.startsWith('tool-')) {
    const name = part.type.slice('tool-'.length);
    if (name && name !== 'approval-request' && name !== 'approval-response') return name;
  }
  return null;
}

function resolveToolPartStatus(part: {
  state?: string;
  output?: unknown;
  result?: unknown;
  error?: unknown;
  errorText?: unknown;
}): ToolOutcomeStatus | null {
  const state = String(part.state || '');
  if (
    state === 'approval-requested' ||
    state === 'input-streaming' ||
    state === 'input-available' ||
    state === 'partial-call' ||
    state === 'call'
  ) {
    return null;
  }
  if (state === 'output-denied' || state === 'denied' || state === 'approval-denied') {
    return 'denied';
  }
  if (state === 'error' || state === 'output-error' || state === 'failed') {
    return 'failure';
  }
  const output = part.output ?? part.result;
  if (
    output &&
    typeof output === 'object' &&
    (('error' in output && (output as { error?: unknown }).error) ||
      (output as { success?: unknown }).success === false)
  ) {
    return 'failure';
  }
  if (part.error != null || (typeof part.errorText === 'string' && part.errorText.trim())) {
    return 'failure';
  }
  const completed =
    !state ||
    ['output-available', 'result', 'completed', 'success'].includes(state) ||
    part.output != null ||
    part.result != null;
  return completed ? 'success' : null;
}

function curatedSuccessCopy(toolName: string): string | null {
  if (toolName === 'log_nutrition_meal') return 'Meal logged to your nutrition diary.';
  if (toolName === 'log_hydration_intake') return 'Hydration updated.';
  if (NUTRITION_TOOL_NAMES.has(toolName)) return 'Nutrition log updated.';
  if (toolName === 'record_wellness_event') return 'Recovery event logged.';
  if (toolName === 'update_wellness_event') return 'Recovery event updated.';
  if (toolName === 'delete_wellness_event') return 'Recovery event removed.';
  if (RECOVERY_TOOL_NAMES.has(toolName)) return 'Recovery context updated.';
  if (toolName === 'get_wellness_metrics') return 'Checked your recovery metrics.';
  if (toolName === 'get_wellness_events') return 'Checked your recovery events.';
  if (WELLNESS_TOOL_NAMES.has(toolName)) return 'Wellness check saved.';
  return null;
}

function outcomeMessage(toolName: string, status: ToolOutcomeStatus): string {
  const label = humanizeToolName(toolName);
  if (status === 'denied') {
    return `${label} was not applied.`;
  }
  if (status === 'failure') {
    return `Couldn't complete ${label}. Try again in chat or use Log.`;
  }
  return curatedSuccessCopy(toolName) || `Coach updated ${label}.`;
}

/**
 * Compact in-thread tool outcomes for nutrition, recovery/wellness, and generic tools.
 * Part shapes mirror coach-wattz web chat (`output-available` / `output-error` / `output-denied`).
 */
export function toolOutcomeSummaries(message: CoachUIMessage): ToolOutcomeSummary[] {
  const summaries: ToolOutcomeSummary[] = [];
  const seen = new Set<string>();

  for (const [index, part] of (message.parts || []).entries()) {
    if (!part || typeof part !== 'object') continue;
    const typed = part as {
      type?: string;
      state?: string;
      toolName?: string;
      toolCallId?: string;
      output?: unknown;
      result?: unknown;
      error?: unknown;
      errorText?: unknown;
    };
    if (typed.type === 'tool-approval-request' || typed.type === 'tool-approval-response') {
      continue;
    }
    const toolName = resolveToolPartName(typed);
    if (!toolName) continue;
    const status = resolveToolPartStatus(typed);
    if (!status) continue;

    const id = typed.toolCallId || `${toolName}-${index}-${status}`;
    if (seen.has(id)) continue;
    seen.add(id);
    summaries.push({
      id,
      toolName,
      status,
      message: outcomeMessage(toolName, status),
    });
  }
  return summaries;
}

/** @deprecated Prefer `toolOutcomeSummaries` — kept for nutrition-only call sites/tests. */
export function nutritionToolSummaries(message: CoachUIMessage): string[] {
  return toolOutcomeSummaries(message)
    .filter(
      (outcome) =>
        outcome.status === 'success' && NUTRITION_TOOL_NAMES.has(outcome.toolName)
    )
    .map((outcome) => outcome.message);
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
