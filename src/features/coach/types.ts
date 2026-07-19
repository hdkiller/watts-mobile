import type { UIMessage } from 'ai';

export const ACTIVE_TURN_STATUSES = [
  'RECEIVED',
  'QUEUED',
  'RUNNING',
  'STREAMING',
  'WAITING_FOR_TOOLS',
] as const;

export const TERMINAL_TURN_STATUSES = [
  'COMPLETED',
  'FAILED',
  'INTERRUPTED',
  'CANCELLED',
] as const;

export type ChatRoomSummary = {
  roomId: string;
  roomName: string;
  avatar?: string | null;
  unreadCount?: number;
  isReadOnly?: boolean;
};

export type ChatMessageMetadata = {
  turnId?: string | null;
  turnStatus?: string | null;
  turnFailureReason?: string | null;
  senderId?: string | null;
  createdAt?: string | Date | null;
  updatedAt?: string | Date | null;
  isDraft?: boolean;
  isRealtimeDraft?: boolean;
  syntheticTyping?: boolean;
  hiddenBecauseEmptyFailure?: boolean;
  hideUntilContent?: boolean;
  pendingApprovals?: unknown[];
  [key: string]: unknown;
};

/** Stored chat message shape from `GET /api/chat/messages`. */
export type StoredChatMessage = {
  id: string;
  role: 'user' | 'assistant' | 'tool' | 'system' | string;
  content?: string;
  parts?: Array<{ type: string; text?: string; [key: string]: unknown }>;
  createdAt?: string | Date | null;
  updatedAt?: string | Date | null;
  metadata?: ChatMessageMetadata | null;
};

/** UI message used with `@ai-sdk/react` plus optional hydrate fields from the API. */
export type CoachUIMessage = UIMessage<ChatMessageMetadata> & {
  content?: string;
  createdAt?: Date;
  updatedAt?: string | Date | null;
};

export type ChatRoomStateSnapshot = {
  latestMessageId: string | null;
  latestMessageCreatedAt: string | null;
  latestMessageUpdatedAt: string | null;
  latestMessageSenderId: string | null;
  activeTurnId: string | null;
  activeTurnStatus: string | null;
  activeTurnUpdatedAt: string | null;
  hasAssistantMessage: boolean;
};

export type WebsocketTokenResponse = {
  token: string;
};
