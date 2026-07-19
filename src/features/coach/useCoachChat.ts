import { useChat } from '@ai-sdk/react';
import { useQueryClient } from '@tanstack/react-query';
import { DefaultChatTransport } from 'ai';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { friendlyError } from '@/src/api/errors';
import { getInstanceUrl } from '@/src/config/instance';
import type { RecoveryContextItem } from '@/src/features/recovery/types';
import { filterActiveToday } from '@/src/features/recovery/mapRecovery';
import { RECOVERY_CONTEXT_KEY } from '@/src/features/recovery/useRecovery';
import type { TodayViewModel } from '@/src/features/today/types';
import { TODAY_QUERY_KEY } from '@/src/features/today/useToday';

import {
  createChatRoom,
  fetchChatMessages,
  fetchChatRooms,
  fetchRoomState,
  fetchWebsocketToken,
  resumeChatTurn,
  retryChatTurn,
  submitChatToolApproval,
  uploadChatImage,
  websocketUrlFromInstance,
} from './api';
import { captureChatPhoto, pickChatImagesFromLibrary } from './attachments';
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
import { decideSessionOpen, findRoomById } from './sessionPolicy';
import type { ChatRoomSummary, CoachUIMessage, PendingAttachment, StoredChatMessage } from './types';

const POLL_INTERVAL_MS = 1500;
const POLL_GRACE_MS = 15000;
const WS_RECONNECT_MS = 3000;
const WS_PING_MS = 30000;

export type UseCoachChatOptions = {
  targetRoomId?: string | null;
};

type UseCoachChatResult = {
  roomId: string | null;
  roomName: string | null;
  isReadOnly: boolean;
  rooms: ChatRoomSummary[];
  roomsLoading: boolean;
  roomListOpen: boolean;
  setRoomListOpen: (open: boolean) => void;
  messages: CoachUIMessage[];
  displayMessages: CoachUIMessage[];
  input: string;
  setInput: (value: string) => void;
  pendingAttachments: PendingAttachment[];
  loading: boolean;
  sending: boolean;
  streaming: boolean;
  awaitingReply: boolean;
  isRealtimeConnected: boolean;
  usingPollFallback: boolean;
  error: string | null;
  sendError: string | null;
  notice: string | null;
  send: (text?: string) => Promise<void>;
  applyStarter: (text: string) => void;
  resumeTurn: () => Promise<void>;
  retryTurn: () => Promise<void>;
  recoverableTurnId: string | null;
  recoverableStatus: string | null;
  refresh: () => Promise<void>;
  selectRoom: (roomId: string) => Promise<void>;
  createRoom: () => Promise<void>;
  refreshRooms: () => Promise<void>;
  attachFromLibrary: () => Promise<void>;
  attachFromCamera: () => Promise<void>;
  removeAttachment: (id: string) => void;
  submitToolApproval: (approval: {
    approvalId: string;
    approved: boolean;
    reason?: string;
  }) => Promise<void>;
};

export function useCoachChat(options: UseCoachChatOptions = {}): UseCoachChatResult {
  const queryClient = useQueryClient();
  const targetRoomId = options.targetRoomId ?? null;

  const [roomId, setRoomId] = useState<string | null>(null);
  const [roomName, setRoomName] = useState<string | null>(null);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [rooms, setRooms] = useState<ChatRoomSummary[]>([]);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [roomListOpen, setRoomListOpen] = useState(false);
  const [input, setInput] = useState('');
  const [pendingAttachments, setPendingAttachments] = useState<PendingAttachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
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
  const approvalInFlight = useRef(new Set<string>());
  const bootstrappedForTarget = useRef<string | null | undefined>(undefined);

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
        setError(friendlyError(err, 'Could not resolve chat API'));
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
      setSendError(friendlyError(err, 'Failed to send message'));
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
        setError(friendlyError(err, 'Failed to load messages'));
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

  const applyActiveRoom = useCallback(
    async (room: ChatRoomSummary, options?: { clearMessages?: boolean }) => {
      setRoomId(room.roomId);
      setRoomName(room.roomName || 'Coach Watts');
      setIsReadOnly(Boolean(room.isReadOnly));
      roomIdRef.current = room.roomId;
      setSeedUsed(false);
      setPendingAttachments([]);
      setSendError(null);
      setInput('');
      if (options?.clearMessages !== false) {
        setMessagesRef.current([]);
      }
      await loadMessages(room.roomId);
    },
    [loadMessages]
  );

  const refreshRooms = useCallback(async () => {
    setRoomsLoading(true);
    try {
      const loaded = await fetchChatRooms();
      if (!activeRef.current) return;
      setRooms(loaded);
    } finally {
      if (activeRef.current) setRoomsLoading(false);
    }
  }, []);

  const selectRoom = useCallback(
    async (nextRoomId: string) => {
      const room = rooms.find((item) => item.roomId === nextRoomId);
      if (!room) {
        const loaded = await fetchChatRooms();
        setRooms(loaded);
        const found = findRoomById(loaded, nextRoomId);
        if (!found) {
          setNotice('Chat not found. Opening a session instead.');
          const decision = decideSessionOpen(loaded);
          if (decision.action === 'select') {
            await applyActiveRoom(decision.room);
          } else {
            const created = await createChatRoom();
            setRooms((prev) => [created, ...prev.filter((r) => r.roomId !== created.roomId)]);
            await applyActiveRoom(created);
          }
          setRoomListOpen(false);
          return;
        }
        await applyActiveRoom(found);
        setRoomListOpen(false);
        return;
      }
      await applyActiveRoom(room);
      setRoomListOpen(false);
    },
    [applyActiveRoom, rooms]
  );

  const createRoom = useCallback(async () => {
    setSendError(null);
    try {
      const created = await createChatRoom();
      setRooms((prev) => [created, ...prev.filter((r) => r.roomId !== created.roomId)]);
      await applyActiveRoom(created);
      setRoomListOpen(false);
      setNotice(null);
    } catch (err) {
      setSendError(friendlyError(err, 'Failed to create chat'));
    }
  }, [applyActiveRoom]);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      // Avoid re-bootstrapping the same target repeatedly (e.g. focus), but re-run when target changes.
      if (bootstrappedForTarget.current === targetRoomId && roomIdRef.current) {
        return;
      }
      bootstrappedForTarget.current = targetRoomId;

      setLoading(true);
      setError(null);
      setNotice(null);
      try {
        const loadedRooms = await fetchChatRooms();
        if (cancelled || !activeRef.current) return;
        setRooms(loadedRooms);

        if (targetRoomId) {
          const targeted = findRoomById(loadedRooms, targetRoomId);
          if (targeted) {
            await applyActiveRoom(targeted);
            void connectWebSocket();
            return;
          }
          setNotice('Chat not found. Starting a session instead.');
        }

        const decision = decideSessionOpen(loadedRooms);
        if (decision.action === 'select') {
          await applyActiveRoom(decision.room);
        } else {
          const created = await createChatRoom();
          if (cancelled || !activeRef.current) return;
          setRooms((prev) => [created, ...prev.filter((r) => r.roomId !== created.roomId)]);
          await applyActiveRoom(created);
        }
        void connectWebSocket();
      } catch (err) {
        if (!cancelled) {
          setError(friendlyError(err, 'Failed to open Coach chat'));
          setLoading(false);
        }
      }
    }

    void bootstrap();

    return () => {
      cancelled = true;
    };
    // Intentionally re-run when deep-link room target changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetRoomId]);

  useEffect(() => {
    return () => {
      stopTurnPolling();
      cleanupWebSocket();
    };
  }, [cleanupWebSocket, stopTurnPolling]);

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

  const ensureAttachmentsUploaded = useCallback(async (): Promise<PendingAttachment[]> => {
    const next = [...pendingAttachments];
    for (let i = 0; i < next.length; i += 1) {
      const item = next[i];
      if (!item || item.uploadedUrl) continue;
      next[i] = { ...item, uploading: true, error: null };
      setPendingAttachments([...next]);
      try {
        const uploaded = await uploadChatImage({
          uri: item.localUri,
          mediaType: item.mediaType,
          filename: item.filename,
        });
        next[i] = {
          ...item,
          uploading: false,
          uploadedUrl: uploaded.url,
          filename: uploaded.filename || item.filename,
          error: null,
        };
      } catch (err) {
        next[i] = {
          ...item,
          uploading: false,
          error: friendlyError(err, 'Upload failed'),
        };
        setPendingAttachments([...next]);
        throw new Error(next[i]?.error || 'Upload failed');
      }
      setPendingAttachments([...next]);
    }
    return next;
  }, [pendingAttachments]);

  const send = useCallback(
    async (rawText?: string) => {
      const text = (rawText ?? input).trim();
      if (!roomIdRef.current || !apiUrl) return;
      if (isReadOnly) {
        setSendError('This chat is read-only. Start a new chat to continue.');
        return;
      }
      if (!text && pendingAttachments.length === 0) return;

      setSendError(null);
      clearError();

      let uploaded: PendingAttachment[] = [];
      try {
        uploaded = await ensureAttachmentsUploaded();
      } catch (err) {
        setSendError(friendlyError(err, 'Failed to upload photo'));
        return;
      }

      let outbound = text;
      if (!seedUsedRef.current && messagesRef.current.length === 0 && text) {
        const today = queryClient.getQueryData<TodayViewModel>(TODAY_QUERY_KEY);
        const recoveryWindow = queryClient.getQueryData<RecoveryContextItem[]>(RECOVERY_CONTEXT_KEY);
        const recovery = recoveryWindow ? filterActiveToday(recoveryWindow) : undefined;
        const seed = buildCoachSeedContext({ today, activeRecovery: recovery });
        outbound = withSeedPrefix(text, seed);
        setSeedUsed(true);
      } else if (!seedUsedRef.current && messagesRef.current.length === 0) {
        setSeedUsed(true);
      }

      const parts: Array<Record<string, unknown>> = [];
      if (outbound) {
        parts.push({ type: 'text', text: outbound });
      }
      for (const attachment of uploaded) {
        if (!attachment.uploadedUrl) continue;
        parts.push({
          type: 'file',
          url: attachment.uploadedUrl,
          mediaType: attachment.mediaType,
          filename: attachment.filename,
        });
      }

      setInput('');
      setPendingAttachments([]);
      setAwaitingTurnStart(true);
      restartTurnPolling({ forceForMs: POLL_GRACE_MS });

      try {
        if (parts.length > 0) {
          await sendMessage({
            role: 'user',
            parts,
          } as Parameters<typeof sendMessage>[0]);
        } else {
          await sendMessage({ text: outbound || ' ' });
        }
      } catch (err) {
        setAwaitingTurnStart(false);
        setSendError(friendlyError(err, 'Failed to send message'));
        setInput(text);
        setPendingAttachments(uploaded.map((item) => ({ ...item, uploading: false })));
      }
    },
    [
      apiUrl,
      clearError,
      ensureAttachmentsUploaded,
      input,
      isReadOnly,
      pendingAttachments.length,
      queryClient,
      restartTurnPolling,
      sendMessage,
    ]
  );

  const applyStarter = useCallback((text: string) => {
    setInput(text);
  }, []);

  const attachFromLibrary = useCallback(async () => {
    if (isReadOnly) return;
    const result = await pickChatImagesFromLibrary(pendingAttachments.length);
    if (!result.ok) {
      if (result.reason !== 'cancelled') setSendError(result.message);
      return;
    }
    setSendError(null);
    setPendingAttachments((prev) => [...prev, ...result.attachments]);
  }, [isReadOnly, pendingAttachments.length]);

  const attachFromCamera = useCallback(async () => {
    if (isReadOnly) return;
    const result = await captureChatPhoto(pendingAttachments.length);
    if (!result.ok) {
      if (result.reason !== 'cancelled') setSendError(result.message);
      return;
    }
    setSendError(null);
    setPendingAttachments((prev) => [...prev, ...result.attachments]);
  }, [isReadOnly, pendingAttachments.length]);

  const removeAttachment = useCallback((id: string) => {
    setPendingAttachments((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const submitToolApproval = useCallback(
    async (approval: { approvalId: string; approved: boolean; reason?: string }) => {
      const currentRoomId = roomIdRef.current;
      if (!currentRoomId) return;
      if (approvalInFlight.current.has(approval.approvalId)) return;
      approvalInFlight.current.add(approval.approvalId);
      setSendError(null);

      try {
        await submitChatToolApproval({
          roomId: currentRoomId,
          approvalId: approval.approvalId,
          approved: approval.approved,
          reason: approval.reason,
        });
        setAwaitingTurnStart(true);
        restartTurnPolling({ forceForMs: POLL_GRACE_MS });
        await loadMessages(currentRoomId, { silent: true });
      } catch (err) {
        approvalInFlight.current.delete(approval.approvalId);
        setSendError(friendlyError(err, 'Tool approval failed'));
        throw err;
      }
    },
    [loadMessages, restartTurnPolling]
  );

  const resumeTurn = useCallback(async () => {
    if (!recoverable.turnId) return;
    setSendError(null);
    try {
      await resumeChatTurn(recoverable.turnId);
      setAwaitingTurnStart(true);
      restartTurnPolling({ forceForMs: POLL_GRACE_MS });
      if (roomIdRef.current) await loadMessages(roomIdRef.current, { silent: true });
    } catch (err) {
      setSendError(friendlyError(err, 'Resume failed'));
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
      setSendError(friendlyError(err, 'Retry failed'));
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
    isReadOnly,
    rooms,
    roomsLoading,
    roomListOpen,
    setRoomListOpen,
    messages,
    displayMessages,
    input,
    setInput,
    pendingAttachments,
    loading: loading || !apiUrl,
    sending,
    streaming,
    awaitingReply: streaming,
    isRealtimeConnected,
    usingPollFallback,
    error: error || (chatError ? friendlyError(chatError, 'Chat error') : null),
    sendError,
    notice,
    send,
    applyStarter,
    resumeTurn,
    retryTurn,
    recoverableTurnId: recoverable.turnId,
    recoverableStatus: recoverable.status,
    refresh,
    selectRoom,
    createRoom,
    refreshRooms,
    attachFromLibrary,
    attachFromCamera,
    removeAttachment,
    submitToolApproval,
  };
}

export function previewMessageText(message: CoachUIMessage): string {
  return messageText(message);
}
