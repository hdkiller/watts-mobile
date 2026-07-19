import { apiFetch } from '@/src/api/client';

import type {
  ChatRoomStateSnapshot,
  ChatRoomSummary,
  StoredChatMessage,
  WebsocketTokenResponse,
} from './types';

export async function fetchChatRooms(): Promise<ChatRoomSummary[]> {
  const response = await apiFetch('/api/chat/rooms');
  if (!response.ok) {
    throw new Error(`Failed to load chat rooms (${response.status})`);
  }
  return (await response.json()) as ChatRoomSummary[];
}

export async function fetchChatMessages(roomId: string): Promise<StoredChatMessage[]> {
  const response = await apiFetch(`/api/chat/messages?roomId=${encodeURIComponent(roomId)}`);
  if (!response.ok) {
    throw new Error(`Failed to load messages (${response.status})`);
  }
  return (await response.json()) as StoredChatMessage[];
}

export async function fetchWebsocketToken(): Promise<string> {
  const response = await apiFetch('/api/websocket-token');
  if (!response.ok) {
    throw new Error(`Failed to mint websocket token (${response.status})`);
  }
  const body = (await response.json()) as WebsocketTokenResponse;
  if (!body?.token) {
    throw new Error('Websocket token missing from response');
  }
  return body.token;
}

export async function fetchRoomState(roomId: string): Promise<ChatRoomStateSnapshot> {
  const response = await apiFetch(`/api/chat/rooms/${encodeURIComponent(roomId)}/state`);
  if (!response.ok) {
    throw new Error(`Failed to load room state (${response.status})`);
  }
  return (await response.json()) as ChatRoomStateSnapshot;
}

export async function resumeChatTurn(turnId: string): Promise<void> {
  const response = await apiFetch(`/api/chat/turns/${encodeURIComponent(turnId)}/resume`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  if (!response.ok) {
    let message = `Resume failed (${response.status})`;
    try {
      const body = (await response.json()) as { message?: string; statusMessage?: string };
      message = body.message || body.statusMessage || message;
    } catch {
      // ignore
    }
    throw new Error(message);
  }
}

export async function retryChatTurn(turnId: string): Promise<void> {
  const response = await apiFetch(`/api/chat/turns/${encodeURIComponent(turnId)}/retry`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  if (!response.ok) {
    let message = `Retry failed (${response.status})`;
    try {
      const body = (await response.json()) as { message?: string; statusMessage?: string };
      message = body.message || body.statusMessage || message;
    } catch {
      // ignore
    }
    throw new Error(message);
  }
}

export function websocketUrlFromInstance(instanceBaseUrl: string): string {
  const url = new URL(instanceBaseUrl);
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  url.pathname = '/api/websocket';
  url.search = '';
  url.hash = '';
  return url.toString();
}
