import { useChat } from '@ai-sdk/react';
import { useQueryClient } from '@tanstack/react-query';
import { DefaultChatTransport } from 'ai';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { getInstanceUrl } from '@/src/config/instance';
import type { RecoveryContextItem } from '@/src/features/recovery/types';
import { ACTIVE_RECOVERY_KEY } from '@/src/features/recovery/useRecovery';
import type { TodayViewModel } from '@/src/features/today/types';
import { TODAY_QUERY_KEY } from '@/src/features/today/useToday';

import {
  fetchChatMessages,
  fetchChatRooms,
  fetchRoomState,
  fetchWebsocketToken,
  resumeChatTurn,
  retryChatTurn,
  websocketUrlFromInstance,
} from './api';
import { coachChatFetch, resolveChatMessagesApiUrl } from './coachFetch';
import {
  applyAssistantTextDelta,
  hasActiveTurn,
  hydrateCoachMessages,
  isActiveTurnStatus,
  isTerminalTurnStatus,
  mergeLoadedMessages,
  messageText,
  upsertChatMessage,
  visibleCoachMessages,
} from './mapMessages';
import { buildCoachSeedContext, withSeedPrefix } from './seedContext';
import type { CoachUIMessage, StoredChatMessage } from './types';

const POLL_INTERVAL_MS = 1500;
const POLL_GRACE_MS = 15000;
const WS_RECONNECT_MS = 3000;
const WS_PING_MS = 30000;

type UseCoachChatResult = {
  roomId: string | null;
  roomName: string | null;
  messages: CoachUIMessage[];
  displayMessages: CoachUIMessage[];
  input: string;
  setInput: (value: string) => void;
  loading: boolean;
  sending: boolean;
  streaming: boolean;
  awaitingReply: boolean;
  isRealtimeConnected: boolean;
  usingPollFallback: boolean;
  error: string | null;
  sendError: string | null;
  send: (text?: string) => Promise<void>;
  applyStarter: (text: string) => void;
  resumeTurn: () => Promise<void>;
  retryTurn: () => Promise<void>;
  recoverableTurnId: string | null;
  recoverableStatus: string | null;
  refresh: () => Promise<void>;
};

export function useCoachChat(): UseCoachChatResult {
  const queryClient = useQueryClient();
  const [roomId, setRoomId] = useState<string | null>(null);
  const [roomName, setRoomName] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const [awaitingTurnStart, setAwaitingTurnStart] = useState(false);
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);
  const [usingPollFallback, setUsingPollFallback] = useState(false);
  const [apiUrl, setApiUrl] = useState<string | null>(null);
  const [seedUsed, setSeedUsed] = useState(false);

  const roomIdRef = useRef<string | null>(null);
  const awaitingTurnStartRef = useRef(false);
  const messagesRef = useRef<CoachUIMessage[]>([]);
  const activeRef = useRef(true);
  const seedUsedRef = useRef(false);
  const wsRef = useRef<WebSocket | null>(null);
  const wsReconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wsPingTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollGraceUntil = useRef(0);
  const loadInFlight = useRef(false);
  const loadPending = useRef(false);
  const setMessagesRef = useRef<(messages: CoachUIMessage[]) => void>(() => {});
  const restartTurnPollingRef = useRef<(options?: { forceForMs?: number }) => void>(() => {});
  const loadMessagesRef = useRef<(id: string, options?: { silent?: boolean }) => Promise<void>>(
    async () => {}
  );
  const isRealtimeConnectedRef = useRef(false);

  useEffect(() => {
    roomIdRef.current = roomId;
  }, [roomId]);

  useEffect(() => {
    awaitingTurnStartRef.current = awaitingTurnStart;
  }, [awaitingTurnStart]);

  useEffect(() => {
    seedUsedRef.current = seedUsed;
  }, [seedUsed]);

  useEffect(() => {
    isRealtimeConnectedRef.current = isRealtimeConnected;
  }, [isRealtimeConnected]);

  useEffect(() => {
    activeRef.current = true;
    return () => {
      activeRef.current = false;
    };
  }, []);

  useEffect(() => {
    void resolveChatMessagesApiUrl()
      .then(setApiUrl)
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Could not resolve chat API');
      });
  }, []);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: apiUrl || 'http://127.0.0.1/api/chat/messages',
        fetch: coachChatFetch as unknown as typeof globalThis.fetch,
        body: () => ({
          roomId: roomIdRef.current,
        }),
        headers: () => ({
          Accept: 'text/event-stream, application/json',
        }),
      }),
    [apiUrl]
  );

  const {
    messages,
    setMessages,
    sendMessage,
    status,
    error: chatError,
    clearError,
  } = useChat<CoachUIMessage>({
    transport,
    onFinish: () => {
      setAwaitingTurnStart(false);
      const id = roomIdRef.current;
      if (id) {
        void loadMessagesRef.current(id, { silent: true });
        restartTurnPollingRef.current({ forceForMs: POLL_GRACE_MS });
      }
    },
    onError: (err) => {
      setAwaitingTurnStart(false);
      setSendError(err.message || 'Failed to send message');
    },
  });

  messagesRef.current = messages;
  setMessagesRef.current = setMessages;

  const stopTurnPolling = useCallback(() => {
    if (pollTimer.current) {
      clearInterval(pollTimer.current);
      pollTimer.current = null;
    }
  }, []);

  const loadMessages = useCallback(async (id: string, options?: { silent?: boolean }) => {
    if (!activeRef.current) return;
    if (loadInFlight.current) {
      loadPending.current = true;
      return;
    }
    loadInFlight.current = true;
    const silent = options?.silent ?? false;
    try {
      if (!silent) setLoading(true);
      const loaded = await fetchChatMessages(id);
      if (!activeRef.current || roomIdRef.current !== id) return;
      const transformed = hydrateCoachMessages(loaded);
      const merged = mergeLoadedMessages(messagesRef.current, transformed);
      setMessagesRef.current(merged);
      if (
        transformed.some(
          (message) =>
            message.role === 'assistant' || isActiveTurnStatus(message.metadata?.turnStatus)
        )
      ) {
        setAwaitingTurnStart(false);
      }
      if (transformed.length > 0) {
        setSeedUsed(true);
      }
      setError(null);
      restartTurnPollingRef.current();
    } catch (err) {
      if (!silent) {
        setError(err instanceof Error ? err.message : 'Failed to load messages');
      }
    } finally {
      loadInFlight.current = false;
      if (!silent) setLoading(false);
      if (loadPending.current) {
        loadPending.current = false;
        void loadMessagesRef.current(id, { silent: true });
      }
    }
  }, []);

  loadMessagesRef.current = loadMessages;

  const restartTurnPolling = useCallback(
    (options?: { forceForMs?: number }) => {
      if (!activeRef.current) return;
      if (options?.forceForMs && options.forceForMs > 0) {
        pollGraceUntil.current = Date.now() + options.forceForMs;
      }

      stopTurnPolling();

      const id = roomIdRef.current;
      const activeTurn = hasActiveTurn(messagesRef.current);
      const hasAssistant = messagesRef.current.some((m) => m.role === 'assistant');
      if (
        !id ||
        (!activeTurn &&
          !awaitingTurnStartRef.current &&
          (hasAssistant || Date.now() >= pollGraceUntil.current))
      ) {
        setUsingPollFallback(false);
        return;
      }

      setUsingPollFallback(!isRealtimeConnectedRef.current);

      pollTimer.current = setInterval(async () => {
        if (!activeRef.current || !roomIdRef.current) {
          stopTurnPolling();
          return;
        }

        const currentId = roomIdRef.current;
        let nextHasActiveTurn = hasActiveTurn(messagesRef.current);
        let nextHasAssistant = messagesRef.current.some((m) => m.role === 'assistant');

        try {
          const roomState = await fetchRoomState(currentId);
          nextHasActiveTurn = isActiveTurnStatus(roomState.activeTurnStatus);
          nextHasAssistant = roomState.hasAssistantMessage;

          if (
            nextHasActiveTurn ||
            awaitingTurnStartRef.current ||
            hasActiveTurn(messagesRef.current)
          ) {
            await loadMessagesRef.current(currentId, { silent: true });
            nextHasActiveTurn = hasActiveTurn(messagesRef.current);
            nextHasAssistant = messagesRef.current.some((m) => m.role === 'assistant');
          }
        } catch {
          try {
            await loadMessagesRef.current(currentId, { silent: true });
            nextHasActiveTurn = hasActiveTurn(messagesRef.current);
            nextHasAssistant = messagesRef.current.some((m) => m.role === 'assistant');
          } catch {
            // ignore
          }
        }

        if (
          !nextHasActiveTurn &&
          !awaitingTurnStartRef.current &&
          (nextHasAssistant || Date.now() >= pollGraceUntil.current)
        ) {
          stopTurnPolling();
          setUsingPollFallback(false);
        }
      }, POLL_INTERVAL_MS);
    },
    [stopTurnPolling]
  );

  restartTurnPollingRef.current = restartTurnPolling;

  const cleanupWebSocket = useCallback(() => {
    if (wsReconnectTimer.current) {
      clearTimeout(wsReconnectTimer.current);
      wsReconnectTimer.current = null;
    }
    if (wsPingTimer.current) {
      clearInterval(wsPingTimer.current);
      wsPingTimer.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsRealtimeConnected(false);
  }, []);

  const connectWebSocket = useCallback(async () => {
    if (!activeRef.current || wsRef.current) return;

    const instanceBaseUrl = await getInstanceUrl();
    if (!instanceBaseUrl) {
      setUsingPollFallback(true);
      restartTurnPollingRef.current({ forceForMs: POLL_GRACE_MS });
      return;
    }

    let socket: WebSocket;
    try {
      socket = new WebSocket(websocketUrlFromInstance(instanceBaseUrl));
    } catch {
      setUsingPollFallback(true);
      restartTurnPollingRef.current({ forceForMs: POLL_GRACE_MS });
      return;
    }

    wsRef.current = socket;
    setIsRealtimeConnected(false);

    socket.onopen = async () => {
      try {
        const token = await fetchWebsocketToken();
        socket.send(JSON.stringify({ type: 'authenticate', token }));
        if (wsPingTimer.current) clearInterval(wsPingTimer.current);
        wsPingTimer.current = setInterval(() => {
          if (socket.readyState === WebSocket.OPEN) {
            socket.send('ping');
          }
        }, WS_PING_MS);
      } catch {
        setUsingPollFallback(true);
        restartTurnPollingRef.current({ forceForMs: POLL_GRACE_MS });
        socket.close();
      }
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(String(event.data)) as {
          type?: string;
          roomId?: string;
          turnId?: string;
          messageId?: string;
          textDelta?: string;
          status?: string;
          message?: StoredChatMessage;
        };

        if (data.type === 'authenticated') {
          setIsRealtimeConnected(true);
          setUsingPollFallback(false);
          const id = roomIdRef.current;
          if (id) void loadMessagesRef.current(id, { silent: true });
          return;
        }

        const currentRoom = roomIdRef.current;
        if (!currentRoom || data.roomId !== currentRoom) return;

        if (
          data.type === 'chat_assistant_text_delta' &&
          typeof data.textDelta === 'string' &&
          data.messageId &&
          data.turnId
        ) {
          setAwaitingTurnStart(false);
          setMessagesRef.current(
            applyAssistantTextDelta(messagesRef.current, {
              messageId: data.messageId,
              turnId: data.turnId,
              textDelta: data.textDelta,
              status: data.status,
            })
          );
          return;
        }

        if (data.type === 'chat_message_upsert' && data.message) {
          if (
            data.message.role === 'assistant' ||
            isActiveTurnStatus(data.message.metadata?.turnStatus)
          ) {
            setAwaitingTurnStart(false);
          }
          setMessagesRef.current(upsertChatMessage(messagesRef.current, data.message));
          if (
            data.message.role === 'assistant' &&
            isTerminalTurnStatus(data.message.metadata?.turnStatus)
          ) {
            void loadMessagesRef.current(currentRoom, { silent: true });
          }
          return;
        }

        if (data.type === 'chat_turn_status' && data.turnId) {
          if (isTerminalTurnStatus(data.status)) {
            setAwaitingTurnStart(false);
            void loadMessagesRef.current(currentRoom, { silent: true });
          }
        }
      } catch {
        // ignore malformed frames
      }
    };

    socket.onclose = () => {
      wsRef.current = null;
      setIsRealtimeConnected(false);
      if (wsPingTimer.current) {
        clearInterval(wsPingTimer.current);
        wsPingTimer.current = null;
      }

      if (hasActiveTurn(messagesRef.current) || awaitingTurnStartRef.current) {
        setUsingPollFallback(true);
        restartTurnPollingRef.current({ forceForMs: POLL_GRACE_MS });
      }

      if (activeRef.current) {
        wsReconnectTimer.current = setTimeout(() => {
          wsReconnectTimer.current = null;
          if (activeRef.current) {
            void connectWebSocket();
          }
        }, WS_RECONNECT_MS);
      }
    };

    socket.onerror = () => {
      socket.close();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      setLoading(true);
      setError(null);
      try {
        const rooms = await fetchChatRooms();
        if (cancelled || !activeRef.current) return;
        const primary = rooms[0];
        if (!primary?.roomId) {
          setError('No chat room available');
          setLoading(false);
          return;
        }
        setRoomId(primary.roomId);
        setRoomName(primary.roomName || 'Coach Watts');
        roomIdRef.current = primary.roomId;
        await loadMessages(primary.roomId);
        void connectWebSocket();
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to open Coach chat');
          setLoading(false);
        }
      }
    }

    void bootstrap();

    return () => {
      cancelled = true;
      stopTurnPolling();
      cleanupWebSocket();
    };
  }, [cleanupWebSocket, connectWebSocket, loadMessages, stopTurnPolling]);

  const streaming = status === 'streaming' || hasActiveTurn(messages) || awaitingTurnStart;
  const sending = status === 'submitted' || status === 'streaming';

  const recoverable = useMemo(() => {
    const latest = [...messages]
      .reverse()
      .find(
        (m) =>
          m.role === 'assistant' &&
          (m.metadata?.turnStatus === 'INTERRUPTED' || m.metadata?.turnStatus === 'FAILED')
      );
    return {
      turnId: (latest?.metadata?.turnId as string | undefined) || null,
      status: latest?.metadata?.turnStatus || null,
    };
  }, [messages]);

  const send = useCallback(
    async (rawText?: string) => {
      const text = (rawText ?? input).trim();
      if (!text || !roomIdRef.current || !apiUrl) return;

      setSendError(null);
      clearError();

      let outbound = text;
      if (!seedUsedRef.current && messagesRef.current.length === 0) {
        const today = queryClient.getQueryData<TodayViewModel>(TODAY_QUERY_KEY);
        const recovery = queryClient.getQueryData<RecoveryContextItem[]>(ACTIVE_RECOVERY_KEY);
        const seed = buildCoachSeedContext({ today, activeRecovery: recovery });
        outbound = withSeedPrefix(text, seed);
        setSeedUsed(true);
      }

      setInput('');
      setAwaitingTurnStart(true);
      restartTurnPolling({ forceForMs: POLL_GRACE_MS });

      try {
        await sendMessage({ text: outbound });
      } catch (err) {
        setAwaitingTurnStart(false);
        setSendError(err instanceof Error ? err.message : 'Failed to send message');
        setInput(text);
      }
    },
    [apiUrl, clearError, input, queryClient, restartTurnPolling, sendMessage]
  );

  const applyStarter = useCallback((text: string) => {
    setInput(text);
  }, []);

  const resumeTurn = useCallback(async () => {
    if (!recoverable.turnId) return;
    setSendError(null);
    try {
      await resumeChatTurn(recoverable.turnId);
      setAwaitingTurnStart(true);
      restartTurnPolling({ forceForMs: POLL_GRACE_MS });
      if (roomIdRef.current) await loadMessages(roomIdRef.current, { silent: true });
    } catch (err) {
      setSendError(err instanceof Error ? err.message : 'Resume failed');
    }
  }, [loadMessages, recoverable.turnId, restartTurnPolling]);

  const retryTurn = useCallback(async () => {
    if (!recoverable.turnId) return;
    setSendError(null);
    try {
      await retryChatTurn(recoverable.turnId);
      setAwaitingTurnStart(true);
      restartTurnPolling({ forceForMs: POLL_GRACE_MS });
      if (roomIdRef.current) await loadMessages(roomIdRef.current, { silent: true });
    } catch (err) {
      setSendError(err instanceof Error ? err.message : 'Retry failed');
    }
  }, [loadMessages, recoverable.turnId, restartTurnPolling]);

  const refresh = useCallback(async () => {
    if (!roomIdRef.current) return;
    await loadMessages(roomIdRef.current);
  }, [loadMessages]);

  const displayMessages = useMemo(() => {
    const visible = visibleCoachMessages(messages);
    const needsTyping =
      awaitingTurnStart ||
      (hasActiveTurn(messages) &&
        !visible.some((m) => m.role === 'assistant' && isActiveTurnStatus(m.metadata?.turnStatus)));

    if (!needsTyping) return visible;

    return [
      ...visible,
      {
        id: `typing-${roomId || 'room'}`,
        role: 'assistant' as const,
        parts: [],
        content: '',
        createdAt: new Date(),
        metadata: { syntheticTyping: true, turnStatus: 'STREAMING' },
      },
    ];
  }, [awaitingTurnStart, messages, roomId]);

  return {
    roomId,
    roomName,
    messages,
    displayMessages,
    input,
    setInput,
    loading: loading || !apiUrl,
    sending,
    streaming,
    awaitingReply: streaming,
    isRealtimeConnected,
    usingPollFallback,
    error: error || (chatError ? chatError.message : null),
    sendError,
    send,
    applyStarter,
    resumeTurn,
    retryTurn,
    recoverableTurnId: recoverable.turnId,
    recoverableStatus: recoverable.status,
    refresh,
  };
}

export function previewMessageText(message: CoachUIMessage): string {
  return messageText(message);
}
