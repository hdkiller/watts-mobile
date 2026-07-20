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

export type ChatRoomLastMessage = {
  content?: string | null;
  senderId?: string | null;
  username?: string | null;
  timestamp?: string | null;
};

export type ChatRoomSummary = {
  roomId: string;
  roomName: string;
  avatar?: string | null;
  unreadCount?: number;
  isReadOnly?: boolean;
  /** Last activity timestamp in ms (`lastMessageAt` / `createdAt` from API). */
  index?: number;
  lastMessage?: ChatRoomLastMessage | null;
};

export type PendingChatApproval = {
  toolCallId: string;
  toolName: string;
  args?: unknown;
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
  pendingApprovals?: PendingChatApproval[];
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

export type PendingAttachment = {
  id: string;
  localUri: string;
  mediaType: string;
  filename: string;
  uploadedUrl?: string;
  uploading?: boolean;
  error?: string | null;
};

export type StorageUploadResponse = {
  success?: boolean;
  url: string;
  filename?: string;
};

export const NUTRITION_TOOL_NAMES = new Set([
  'log_nutrition_meal',
  'log_hydration_intake',
  'patch_nutrition_items',
  'delete_nutrition_item',
  'delete_hydration',
  'get_nutrition_log',
  'get_daily_fueling_status',
]);

/** Journey / recovery-event write tools from coach-wattz `ai-tools/journey`. */
export const RECOVERY_TOOL_NAMES = new Set([
  'record_wellness_event',
  'update_wellness_event',
  'delete_wellness_event',
]);

/** Wellness metrics tools from coach-wattz `ai-tools/wellness`. */
export const WELLNESS_TOOL_NAMES = new Set(['get_wellness_metrics', 'get_wellness_events']);

/** Recommendation tools from coach-wattz recommendations skill. */
export const RECOMMENDATION_TOOL_NAMES = new Set([
  'recommend_workout',
  'get_recommendation_details',
  'list_pending_recommendations',
]);

/** Planned-workout lite tools (create/update/reschedule + common reads). */
export const PLANNED_TOOL_NAMES = new Set([
  'create_planned_workout',
  'update_planned_workout',
  'reschedule_planned_workout',
  'get_planned_workouts',
  'get_planned_workout_details',
]);

/** Completed-activity read tools. */
export const ACTIVITY_TOOL_NAMES = new Set([
  'get_recent_workouts',
  'search_workouts',
  'get_workout_details',
]);

/** Compact domain buckets for chip tint/icon (not full web taxonomy). */
export type ToolDomain = 'nutrition' | 'wellness' | 'planning' | 'workouts' | 'other';

export type ToolOutcomeStatus = 'success' | 'failure' | 'denied';

export type ToolOutcomeSummary = {
  id: string;
  toolName: string;
  status: ToolOutcomeStatus;
  message: string;
  domain: ToolDomain;
};

export type ToolInProgressSummary = {
  id: string;
  toolName: string;
  label: string;
  domain: ToolDomain;
};

export const MAX_CHAT_ATTACHMENTS = 4;
