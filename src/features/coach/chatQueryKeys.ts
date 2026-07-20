/** Query keys for Coach chat cache (written by useCoachChat; persisted offline). */
export const CHAT_ROOMS_QUERY_KEY = ['chat', 'rooms'] as const;

export function chatMessagesQueryKey(roomId: string) {
  return ['chat', 'messages', roomId] as const;
}
