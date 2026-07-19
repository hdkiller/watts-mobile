import { useEffect, useRef, useState } from 'react';
import {
  ActionSheetIOS,
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SymbolView, type SFSymbol } from 'expo-symbols';
import { Button } from '@/src/components/Button';
import { Colors } from '@/src/theme/colors';

import {
  extractPendingApprovals,
  messageImageParts,
  messageText,
  toolOutcomeSummaries,
} from './mapMessages';
import { MarkdownLite } from './markdownLite';
import { RoomListSheet } from './RoomListSheet';
import { COACH_STARTER_PROMPTS, DISCUSS_TODAY_PROMPT } from './starterPrompts';
import type { CoachUIMessage, ToolOutcomeSummary } from './types';
import { useCoachChat } from './useCoachChat';

function ChatGlyph({
  sf,
  emoji,
  size = 18,
  tint = '#fafafa',
}: {
  sf: SFSymbol;
  emoji: string;
  size?: number;
  tint?: string;
}) {
  if (Platform.OS === 'ios') {
    return <SymbolView name={sf} size={size} tintColor={tint} />;
  }
  return <Text style={{ fontSize: size - 2, color: tint }}>{emoji}</Text>;
}

function ToolOutcomeCard({ outcome }: { outcome: ToolOutcomeSummary }) {
  const containerClass =
    outcome.status === 'success'
      ? 'border-green-700/50 bg-green-950/30'
      : outcome.status === 'denied'
        ? 'border-zinc-600 bg-zinc-900'
        : 'border-red-800/50 bg-red-950/30';
  const textClass =
    outcome.status === 'success'
      ? 'text-green-400'
      : outcome.status === 'denied'
        ? 'text-ink-muted'
        : 'text-red-300';
  return (
    <View className={`mt-2 rounded-xl border px-3 py-2 ${containerClass}`}>
      <Text className={`text-sm font-medium ${textClass}`}>{outcome.message}</Text>
    </View>
  );
}

function Bubble({
  message,
  onApprove,
}: {
  message: CoachUIMessage;
  onApprove: (payload: { approvalId: string; approved: boolean }) => void;
}) {
  const isUser = message.role === 'user';
  const typing = Boolean(message.metadata?.syntheticTyping);
  const text = messageText(message).trim();
  const images = messageImageParts(message);
  const approvals = extractPendingApprovals(message);
  const toolNotes = toolOutcomeSummaries(message);

  return (
    <View className={`mb-3 max-w-[88%] ${isUser ? 'self-end' : 'self-start'}`}>
      <View
        className={`rounded-2xl px-4 py-3 ${
          isUser ? 'bg-brand' : 'border border-zinc-700 bg-zinc-900'
        }`}
      >
        {typing ? (
          <Text className="text-sm text-ink-muted">Coach is typing…</Text>
        ) : (
          <>
            {images.map((image) => (
              <Image
                key={image.url}
                source={{ uri: image.url }}
                className="mb-2 h-40 w-52 rounded-xl"
                resizeMode="cover"
              />
            ))}
            {text ? (
              isUser ? (
                <Text className="text-base leading-6 text-zinc-950">{text}</Text>
              ) : (
                <MarkdownLite text={text} className="text-base leading-6 text-white" />
              )
            ) : null}
            {!text && images.length === 0 && !typing ? (
              <Text className={`text-base ${isUser ? 'text-zinc-950' : 'text-white'}`}>…</Text>
            ) : null}
          </>
        )}
      </View>

      {toolNotes.map((note) => (
        <ToolOutcomeCard key={note.id} outcome={note} />
      ))}

      {approvals.map((approval) => (
        <View
          key={approval.toolCallId}
          className="mt-2 rounded-xl border border-amber-700/60 bg-amber-950/40 px-3 py-3"
        >
          <Text className="text-sm font-semibold text-amber-100">
            Approve {approval.toolName.replace(/_/g, ' ')}?
          </Text>
          <View className="mt-3 flex-row gap-2">
            <Pressable
              className="rounded-lg bg-brand px-3 py-2 active:opacity-80"
              onPress={() => onApprove({ approvalId: approval.toolCallId, approved: true })}
            >
              <Text className="text-sm font-semibold text-zinc-950">Approve</Text>
            </Pressable>
            <Pressable
              className="rounded-lg border border-zinc-600 px-3 py-2 active:opacity-80"
              onPress={() => onApprove({ approvalId: approval.toolCallId, approved: false })}
            >
              <Text className="text-sm font-semibold text-white">Deny</Text>
            </Pressable>
          </View>
        </View>
      ))}
    </View>
  );
}

function AttachSheet({
  visible,
  onClose,
  onCamera,
  onLibrary,
}: {
  visible: boolean;
  onClose: () => void;
  onCamera: () => void;
  onLibrary: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable className="flex-1 justify-end bg-black/50" onPress={onClose}>
        <Pressable
          className="rounded-t-3xl border-t border-zinc-700 bg-zinc-900 px-5 pb-10 pt-4"
          onPress={(event) => event.stopPropagation()}
        >
          <View className="mb-4 items-center">
            <View className="h-1 w-10 rounded-full bg-zinc-600" />
          </View>
          <Text className="text-lg font-semibold text-white">Attach photo</Text>
          <Text className="mt-1 text-sm text-ink-muted">
            Send a meal or context photo to Coach.
          </Text>
          <Pressable
            className="mt-5 rounded-xl border border-zinc-700 px-4 py-3.5 active:opacity-80"
            onPress={() => {
              onClose();
              onCamera();
            }}
          >
            <Text className="text-base font-semibold text-white">Camera</Text>
          </Pressable>
          <Pressable
            className="mt-2 rounded-xl border border-zinc-700 px-4 py-3.5 active:opacity-80"
            onPress={() => {
              onClose();
              onLibrary();
            }}
          >
            <Text className="text-base font-semibold text-white">Photo library</Text>
          </Pressable>
          <Pressable className="mt-3 px-4 py-3 active:opacity-80" onPress={onClose}>
            <Text className="text-center text-base font-semibold text-ink-muted">Cancel</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export function CoachChat({
  targetRoomId,
  autoAttach,
  discussToday = false,
}: {
  targetRoomId?: string | null;
  autoAttach?: 'camera' | 'library' | null;
  /** When true, start (or open a new) chat seeded with today’s recommendation context. */
  discussToday?: boolean;
}) {
  const listRef = useRef<FlatList<CoachUIMessage>>(null);
  const autoAttachHandled = useRef(false);
  const discussHandled = useRef(false);
  const [attachSheetOpen, setAttachSheetOpen] = useState(false);
  const chat = useCoachChat({ targetRoomId });

  useEffect(() => {
    if (chat.displayMessages.length === 0) return;
    const timer = setTimeout(() => {
      listRef.current?.scrollToEnd({ animated: true });
    }, 50);
    return () => clearTimeout(timer);
  }, [chat.displayMessages, chat.streaming]);

  useEffect(() => {
    if (!autoAttach || autoAttachHandled.current || chat.loading || chat.isReadOnly) return;
    autoAttachHandled.current = true;
    if (autoAttach === 'camera') {
      void chat.attachFromCamera();
    } else {
      void chat.attachFromLibrary();
    }
    // Only trigger once when Coach finishes initial load for this mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoAttach, chat.loading, chat.isReadOnly]);

  useEffect(() => {
    if (!discussToday || discussHandled.current || chat.loading || chat.isReadOnly || chat.sending) {
      return;
    }
    discussHandled.current = true;
    void (async () => {
      if (chat.displayMessages.length > 0) {
        await chat.createRoom();
      }
      chat.applyStarter(DISCUSS_TODAY_PROMPT);
      await chat.send(DISCUSS_TODAY_PROMPT);
    })();
    // One-shot when Coach finishes load for a discuss deep-link from Today.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [discussToday, chat.loading, chat.isReadOnly, chat.sending]);

  const openAttachMenu = () => {
    if (chat.isReadOnly || chat.sending) return;
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: 'Attach photo',
          message: 'Send a meal or context photo to Coach.',
          options: ['Cancel', 'Camera', 'Photo library'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) void chat.attachFromCamera();
          if (buttonIndex === 2) void chat.attachFromLibrary();
        }
      );
      return;
    }
    setAttachSheetOpen(true);
  };

  if (chat.loading && chat.displayMessages.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-surface-dark">
        <ActivityIndicator color={Colors.brand} size="large" />
        <Text className="mt-3 text-sm text-ink-muted">Opening Coach…</Text>
      </View>
    );
  }

  if (chat.error && chat.displayMessages.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-surface-dark px-6">
        <Text className="text-center text-base text-white">{chat.error}</Text>
        <Button className="mt-4 self-stretch" label="Try again" onPress={() => void chat.refresh()} />
      </View>
    );
  }

  const empty = chat.displayMessages.length === 0;
  const canSend =
    !chat.isReadOnly &&
    !chat.sending &&
    (Boolean(chat.input.trim()) || chat.pendingAttachments.length > 0);

  const statusLine = chat.streaming
    ? chat.isRealtimeConnected
      ? 'Streaming reply…'
      : chat.usingPollFallback
        ? 'Waiting for reply (polling)…'
        : 'Waiting for reply…'
    : null;

  return (
    <View className="flex-1 bg-surface-dark">
      <View className="border-b border-zinc-800 px-5 pb-3 pt-2">
        <View className="flex-row items-center justify-between gap-3">
          <Pressable
            className="min-w-0 flex-1 active:opacity-80"
            accessibilityRole="button"
            accessibilityLabel={`Switch chats. Current: ${chat.roomName || 'Coach Watts'}`}
            onPress={() => {
              void chat.refreshRooms();
              chat.setRoomListOpen(true);
            }}
          >
            <View className="flex-row items-center gap-2">
              <View
                className={`h-2.5 w-2.5 rounded-full ${
                  chat.isRealtimeConnected ? 'bg-green-400' : 'bg-zinc-500'
                }`}
                accessibilityLabel={
                  chat.isRealtimeConnected ? 'Live connection' : 'Polling connection'
                }
              />
              <Text className="min-w-0 flex-shrink text-2xl font-semibold text-white" numberOfLines={1}>
                {chat.roomName || 'Coach Watts'}
              </Text>
              <ChatGlyph sf="chevron.down" emoji="▾" size={14} tint="#a1a1aa" />
            </View>
            {statusLine ? (
              <Text className="mt-1 text-sm text-ink-muted">{statusLine}</Text>
            ) : null}
          </Pressable>
          <Pressable
            className="rounded-xl border border-zinc-600 px-3 py-2 active:opacity-80"
            onPress={() => void chat.createRoom()}
          >
            <Text className="text-sm font-semibold text-white">New</Text>
          </Pressable>
        </View>
      </View>

      {chat.notice ? (
        <Text className="px-5 pt-2 text-sm text-amber-300">{chat.notice}</Text>
      ) : null}

      {chat.isReadOnly ? (
        <View className="mx-5 mt-3 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3">
          <Text className="text-sm text-ink-muted">
            This chat is read-only. Start a new chat to keep talking with Coach.
          </Text>
          <Pressable className="mt-2" hitSlop={8} onPress={() => void chat.createRoom()}>
            <Text className="text-sm font-semibold text-brand">New chat</Text>
          </Pressable>
        </View>
      ) : null}

      {empty ? (
        <View className="flex-1 px-5 pt-6">
          <Text className="text-base text-ink-muted">
            Ask Coach Watts about today’s recommendation or how you feel. Short questions work
            best — or attach a meal photo to log nutrition.
          </Text>
          <View className="mt-5">
            {COACH_STARTER_PROMPTS.map((prompt) => (
              <Pressable
                key={prompt.id}
                className="mb-3 rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-3 active:opacity-80"
                disabled={chat.isReadOnly}
                onPress={() => {
                  chat.applyStarter(prompt.text);
                  void chat.send(prompt.text);
                }}
              >
                <Text className="text-base font-semibold text-white">{prompt.label}</Text>
                <Text className="mt-1 text-sm text-ink-muted">{prompt.text}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : (
        <FlatList
          ref={listRef}
          className="flex-1 px-4 pt-3"
          data={chat.displayMessages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Bubble
              message={item}
              onApprove={(payload) => {
                void chat.submitToolApproval(payload);
              }}
            />
          )}
          contentContainerStyle={{ paddingBottom: 16 }}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        />
      )}

      {chat.sendError ? (
        <Text className="px-5 pb-2 text-sm text-red-400">{chat.sendError}</Text>
      ) : null}

      {chat.recoverableTurnId ? (
        <View className="flex-row gap-3 px-5 pb-2">
          {chat.recoverableStatus === 'INTERRUPTED' ? (
            <Pressable
              className="rounded-lg border border-zinc-600 px-3 py-2 active:opacity-80"
              onPress={() => void chat.resumeTurn()}
            >
              <Text className="text-sm font-semibold text-white">Resume</Text>
            </Pressable>
          ) : null}
          <Pressable
            className="rounded-lg border border-zinc-600 px-3 py-2 active:opacity-80"
            onPress={() => void chat.retryTurn()}
          >
            <Text className="text-sm font-semibold text-white">Retry</Text>
          </Pressable>
        </View>
      ) : null}

      {chat.pendingAttachments.length > 0 ? (
        <View className="flex-row flex-wrap gap-2 px-4 pb-2">
          {chat.pendingAttachments.map((attachment) => (
            <View key={attachment.id} className="relative">
              <Image
                source={{ uri: attachment.localUri }}
                className="h-16 w-16 rounded-xl border border-zinc-700"
              />
              {attachment.uploading ? (
                <View className="absolute inset-0 items-center justify-center rounded-xl bg-black/50">
                  <ActivityIndicator color={Colors.brand} />
                </View>
              ) : null}
              <Pressable
                className="absolute -right-1 -top-1 h-5 w-5 items-center justify-center rounded-full bg-zinc-800"
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Remove attachment"
                onPress={() => chat.removeAttachment(attachment.id)}
              >
                <Text className="text-xs text-white">×</Text>
              </Pressable>
            </View>
          ))}
        </View>
      ) : null}

      <View className="flex-row items-end gap-2 border-t border-zinc-800 px-4 py-3">
        <Pressable
          className={`h-12 w-12 items-center justify-center rounded-full border border-zinc-700 ${
            chat.isReadOnly || chat.sending ? 'opacity-40' : 'active:opacity-80'
          }`}
          disabled={chat.isReadOnly || chat.sending}
          accessibilityRole="button"
          accessibilityLabel="Attach photo"
          onPress={openAttachMenu}
        >
          <ChatGlyph sf="plus" emoji="＋" size={20} />
        </Pressable>
        <TextInput
          className="max-h-28 flex-1 rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-base text-white"
          placeholder={chat.isReadOnly ? 'Read-only chat' : 'Message Coach Watts'}
          placeholderTextColor={Colors.textMuted}
          value={chat.input}
          onChangeText={chat.setInput}
          multiline
          editable={!chat.sending && !chat.isReadOnly}
        />
        <Pressable
          className={`h-12 w-12 items-center justify-center rounded-full ${
            canSend ? 'bg-brand' : 'bg-zinc-700'
          }`}
          disabled={!canSend}
          accessibilityRole="button"
          accessibilityLabel="Send message"
          onPress={() => void chat.send()}
        >
          {chat.sending ? (
            <ActivityIndicator color={Colors.background} />
          ) : (
            <ChatGlyph
              sf="arrow.up"
              emoji="↑"
              size={18}
              tint={canSend ? '#09090b' : '#a1a1aa'}
            />
          )}
        </Pressable>
      </View>

      <AttachSheet
        visible={attachSheetOpen}
        onClose={() => setAttachSheetOpen(false)}
        onCamera={() => void chat.attachFromCamera()}
        onLibrary={() => void chat.attachFromLibrary()}
      />

      <RoomListSheet
        visible={chat.roomListOpen}
        rooms={chat.rooms}
        activeRoomId={chat.roomId}
        loading={chat.roomsLoading}
        onClose={() => chat.setRoomListOpen(false)}
        onSelect={(roomId) => void chat.selectRoom(roomId)}
        onCreate={() => void chat.createRoom()}
        onRefresh={() => void chat.refreshRooms()}
      />
    </View>
  );
}
