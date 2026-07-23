import { useEffect, useRef, useState } from 'react';
import {
  ActionSheetIOS,
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { SFSymbol } from 'expo-symbols';
import { Button } from '@/src/components/Button';
import { AppSymbol } from '@/src/components/AppSymbol';
import { CoachChatSkeleton } from '@/src/components/Skeleton';
import { useKeyboardOverlap } from '@/src/hooks/useKeyboardOverlap';
import { Colors } from '@/src/theme/colors';
import { useThemeColors } from '@/src/theme/useThemeColors';

import {
  approvalPreviewLine,
  extractPendingApprovals,
  humanizeToolName,
  messageImageParts,
  displayMessageText,
  resolveToolDomain,
  toolInProgressSummaries,
  toolOutcomeSummaries,
} from './mapMessages';
import { MarkdownLite } from './markdownLite';
import { RoomListSheet } from './RoomListSheet';
import {
  COACH_STARTER_PROMPTS,
  DISCUSS_SESSION_PROMPT,
  DISCUSS_TODAY_PROMPT,
} from './starterPrompts';
import type {
  CoachUIMessage,
  ToolDomain,
  ToolInProgressSummary,
  ToolOutcomeSummary,
} from './types';
import { useCoachChat } from './useCoachChat';
import { useCoachDictation } from './useCoachDictation';

function ChatGlyph({
  sf,
  emoji,
  size = 18,
  tint,
}: {
  sf: SFSymbol;
  emoji: string;
  size?: number;
  tint?: string;
}) {
  const theme = useThemeColors();
  const color = tint ?? theme.textPrimary;
  return <AppSymbol sf={sf} size={size} tintColor={color} fallback={emoji} />;
}

function domainGlyph(domain: ToolDomain): { sf: SFSymbol; emoji: string; tint: string } {
  switch (domain) {
    case 'nutrition':
      return { sf: 'fork.knife', emoji: '🍽', tint: '#34d399' };
    case 'wellness':
      return { sf: 'heart.fill', emoji: '♥', tint: '#fb7185' };
    case 'planning':
      return { sf: 'calendar', emoji: '📅', tint: '#a5b4fc' };
    case 'workouts':
      return { sf: 'figure.run', emoji: '🏃', tint: '#38bdf8' };
    default:
      return { sf: 'wrench.and.screwdriver', emoji: '🔧', tint: '#94a3b8' };
  }
}

function domainAccentBorder(domain: ToolDomain): string {
  switch (domain) {
    case 'nutrition':
      return 'border-emerald-800/40';
    case 'wellness':
      return 'border-rose-800/40';
    case 'planning':
      return 'border-indigo-800/40';
    case 'workouts':
      return 'border-sky-800/40';
    default:
      return 'border-border-strong';
  }
}

function ToolProgressChip({ item }: { item: ToolInProgressSummary }) {
  const glyph = domainGlyph(item.domain);
  return (
    <View
      className={`mt-2 flex-row items-center gap-2 rounded-xl border bg-card/80 px-3 py-2 ${domainAccentBorder(item.domain)}`}
    >
      <ActivityIndicator size="small" color={glyph.tint} />
      <ChatGlyph sf={glyph.sf} emoji={glyph.emoji} size={14} tint={glyph.tint} />
      <Text className="flex-1 text-sm text-text-muted">{item.label}</Text>
    </View>
  );
}

function ToolOutcomeCard({ outcome }: { outcome: ToolOutcomeSummary }) {
  const glyph = domainGlyph(outcome.domain);
  const containerClass =
    outcome.status === 'success'
      ? 'border-green-700/50 bg-tint-success'
      : outcome.status === 'denied'
        ? `bg-card ${domainAccentBorder(outcome.domain)}`
        : 'border-red-800/50 bg-tint-error';
  const textClass =
    outcome.status === 'success'
      ? 'text-green-400'
      : outcome.status === 'denied'
        ? 'text-text-muted'
        : 'text-red-300';
  const iconTint =
    outcome.status === 'success'
      ? glyph.tint
      : outcome.status === 'denied'
        ? '#94a3b8'
        : '#f87171';
  return (
    <View className={`mt-2 flex-row items-start gap-2 rounded-xl border px-3 py-2 ${containerClass}`}>
      <View className="mt-0.5">
        <ChatGlyph sf={glyph.sf} emoji={glyph.emoji} size={14} tint={iconTint} />
      </View>
      <Text className={`flex-1 text-sm font-medium ${textClass}`}>{outcome.message}</Text>
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
  const text = displayMessageText(message).trim();
  const images = messageImageParts(message);
  const approvals = extractPendingApprovals(message);
  const toolNotes = toolOutcomeSummaries(message);
  const toolProgress = toolInProgressSummaries(message);

  return (
    <View className={`mb-3 max-w-[88%] ${isUser ? 'self-end' : 'self-start'}`}>
      <View
        className={`rounded-2xl px-4 py-3 ${
          isUser ? 'bg-brand' : 'border border-border-strong bg-card'
        }`}
      >
        {typing ? (
          <Text className="text-sm text-text-muted">Coach is typing…</Text>
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
                <Text className="text-base leading-6 text-ink">{text}</Text>
              ) : (
                <MarkdownLite text={text} className="text-base leading-6 text-text-primary" />
              )
            ) : null}
            {!text && images.length === 0 && !typing ? (
              <Text className={`text-base ${isUser ? 'text-ink' : 'text-text-primary'}`}>…</Text>
            ) : null}
          </>
        )}
      </View>

      {toolProgress.map((item) => (
        <ToolProgressChip key={item.id} item={item} />
      ))}

      {toolNotes.map((note) => (
        <ToolOutcomeCard key={note.id} outcome={note} />
      ))}

      {approvals.map((approval) => {
        const preview = approvalPreviewLine(approval.args);
        const domain = resolveToolDomain(approval.toolName);
        const glyph = domainGlyph(domain);
        return (
          <View
            key={approval.toolCallId}
            className={`mt-2 rounded-xl border border-amber-700/60 bg-amber-950/40 px-3 py-3 ${domainAccentBorder(domain)}`}
          >
            <View className="flex-row items-center gap-2">
              <ChatGlyph sf={glyph.sf} emoji={glyph.emoji} size={14} tint={glyph.tint} />
              <Text className="flex-1 text-sm font-semibold text-amber-100">
                Approve {humanizeToolName(approval.toolName)}?
              </Text>
            </View>
            {preview ? (
              <Text className="mt-1 text-xs text-amber-200/80" numberOfLines={1}>
                {preview}
              </Text>
            ) : null}
            <View className="mt-3 flex-row gap-2">
              <Pressable
                className="rounded-lg bg-brand px-3 py-2 active:opacity-80"
                onPress={() => onApprove({ approvalId: approval.toolCallId, approved: true })}
              >
                <Text className="text-sm font-semibold text-ink">Approve</Text>
              </Pressable>
              <Pressable
                className="rounded-lg border border-border-strong px-3 py-2 active:opacity-80"
                onPress={() => onApprove({ approvalId: approval.toolCallId, approved: false })}
              >
                <Text className="text-sm font-semibold text-text-primary">Deny</Text>
              </Pressable>
            </View>
          </View>
        );
      })}
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
          className="rounded-t-3xl border-t border-border-strong bg-card px-5 pb-10 pt-4"
          onPress={(event) => event.stopPropagation()}
        >
          <View className="mb-4 items-center">
            <View className="h-1 w-10 rounded-full bg-border-strong" />
          </View>
          <Text className="text-lg font-semibold text-text-primary">Attach photo</Text>
          <Text className="mt-1 text-sm text-text-muted">
            Send a meal or context photo to Coach.
          </Text>
          <Pressable
            className="mt-5 rounded-xl border border-border-strong px-4 py-3.5 active:opacity-80"
            onPress={() => {
              onClose();
              onCamera();
            }}
          >
            <Text className="text-base font-semibold text-text-primary">Camera</Text>
          </Pressable>
          <Pressable
            className="mt-2 rounded-xl border border-border-strong px-4 py-3.5 active:opacity-80"
            onPress={() => {
              onClose();
              onLibrary();
            }}
          >
            <Text className="text-base font-semibold text-text-primary">Photo library</Text>
          </Pressable>
          <Pressable className="mt-3 px-4 py-3 active:opacity-80" onPress={onClose}>
            <Text className="text-center text-base font-semibold text-text-muted">Cancel</Text>
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
  discussSession = false,
}: {
  targetRoomId?: string | null;
  autoAttach?: 'camera' | 'library' | null;
  /** When true, start (or open a new) chat seeded with today’s recommendation context. */
  discussToday?: boolean;
  /** When true, start chat seeded with staged planned/activity session context. */
  discussSession?: boolean;
}) {
  const theme = useThemeColors();
  const listRef = useRef<FlatList<CoachUIMessage>>(null);
  const autoAttachHandled = useRef(false);
  const discussHandled = useRef(false);
  const [attachSheetOpen, setAttachSheetOpen] = useState(false);
  const { containerRef, overlap } = useKeyboardOverlap();
  const chat = useCoachChat({ targetRoomId });
  const dictation = useCoachDictation({
    canStart: !chat.isReadOnly && !chat.sending,
    input: chat.input,
    setInput: chat.setInput,
  });

  useEffect(() => {
    if (chat.displayMessages.length === 0) return;
    const timer = setTimeout(() => {
      listRef.current?.scrollToEnd({ animated: true });
    }, 50);
    return () => clearTimeout(timer);
  }, [chat.displayMessages, chat.streaming]);

  // Keep the newest messages visible above the composer when the keyboard opens.
  useEffect(() => {
    if (overlap === 0) return;
    const timer = setTimeout(() => {
      listRef.current?.scrollToEnd({ animated: true });
    }, 50);
    return () => clearTimeout(timer);
  }, [overlap]);

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
    const discuss = discussToday || discussSession;
    if (!discuss || discussHandled.current || chat.loading || chat.isReadOnly || chat.sending) {
      return;
    }
    discussHandled.current = true;
    const prompt = discussSession ? DISCUSS_SESSION_PROMPT : DISCUSS_TODAY_PROMPT;
    void (async () => {
      if (chat.displayMessages.length > 0) {
        await chat.createRoom();
      }
      chat.applyStarter(prompt);
      await chat.send(prompt);
    })();
    // One-shot when Coach finishes load for a discuss deep-link.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [discussToday, discussSession, chat.loading, chat.isReadOnly, chat.sending]);

  const openAttachMenu = () => {
    if (chat.isReadOnly || chat.sending || dictation.isRecording || dictation.isTranscribing) {
      return;
    }
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
    return <CoachChatSkeleton />;
  }

  if (chat.error && chat.displayMessages.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-surface px-6">
        <Text className="text-center text-base text-text-primary">{chat.error}</Text>
        <Button className="mt-4 self-stretch" label="Try again" onPress={() => void chat.refresh()} />
      </View>
    );
  }

  const empty = chat.displayMessages.length === 0;
  const composerBusy = chat.sending || dictation.isRecording || dictation.isTranscribing;
  const canSend =
    !chat.isReadOnly &&
    !composerBusy &&
    (Boolean(chat.input.trim()) || chat.pendingAttachments.length > 0);
  // Stop must stay tappable while recording even if a send/stream flips `sending`.
  const canDictate =
    !chat.isReadOnly &&
    !dictation.isTranscribing &&
    (dictation.isRecording || !chat.sending);
  const composerEmpty =
    !chat.input.trim() && chat.pendingAttachments.length === 0 && !dictation.isRecording;

  const statusLine =
    dictation.statusLine ??
    (chat.streaming
      ? chat.isRealtimeConnected
        ? 'Streaming reply…'
        : chat.usingPollFallback
          ? 'Waiting for reply (polling)…'
          : 'Waiting for reply…'
      : null);

  return (
    <View
      ref={containerRef}
      className="flex-1 bg-surface"
      style={{ paddingBottom: overlap }}
    >
      <View className="border-b border-border px-5 pb-3 pt-2">
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
                  chat.isRealtimeConnected ? 'bg-green-400' : 'bg-text-muted'
                }`}
                accessibilityLabel={
                  chat.isRealtimeConnected ? 'Live connection' : 'Polling connection'
                }
              />
              <Text className="min-w-0 flex-shrink text-2xl font-semibold text-text-primary" numberOfLines={1}>
                {chat.roomName || 'Coach Watts'}
              </Text>
              <ChatGlyph sf="chevron.down" emoji="▾" size={14} tint={theme.textMuted} />
            </View>
            {statusLine ? (
              <Text className="mt-1 text-sm text-text-muted">{statusLine}</Text>
            ) : null}
          </Pressable>
          <Pressable
            className="rounded-xl border border-border-strong px-3 py-2 active:opacity-80"
            onPress={() => void chat.createRoom()}
          >
            <Text className="text-sm font-semibold text-text-primary">New</Text>
          </Pressable>
        </View>
      </View>

      {chat.notice ? (
        <Text className="px-5 pt-2 text-sm text-amber-300">{chat.notice}</Text>
      ) : null}

      {chat.isReadOnly ? (
        <View className="mx-5 mt-3 rounded-xl border border-border-strong bg-card px-4 py-3">
          <Text className="text-sm text-text-muted">
            This chat is read-only. Start a new chat to keep talking with Coach.
          </Text>
          <Pressable className="mt-2" hitSlop={8} onPress={() => void chat.createRoom()}>
            <Text className="text-sm font-semibold text-brand">New chat</Text>
          </Pressable>
        </View>
      ) : null}

      {empty ? (
        <ScrollView
          className="flex-1 px-5 pt-6"
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
        >
          <Text className="text-base text-text-muted">
            Ask Coach Watts about today’s recommendation or how you feel. Short questions work
            best — or attach a meal photo to log nutrition.
          </Text>
          <View className="mt-5">
            {COACH_STARTER_PROMPTS.map((prompt) => (
              <Pressable
                key={prompt.id}
                className="mb-3 rounded-2xl border border-border-strong bg-card px-4 py-3 active:opacity-80"
                disabled={chat.isReadOnly}
                onPress={() => {
                  chat.applyStarter(prompt.text);
                  void chat.send(prompt.text);
                }}
              >
                <Text className="text-base font-semibold text-text-primary">{prompt.label}</Text>
                <Text className="mt-1 text-sm text-text-muted">{prompt.text}</Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
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
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        />
      )}

      {chat.sendError ? (
        <Text className="px-5 pb-2 text-sm text-red-400">{chat.sendError}</Text>
      ) : null}

      {dictation.error ? (
        <Text className="px-5 pb-2 text-sm text-red-400">{dictation.error}</Text>
      ) : null}

      {chat.recoverableTurnId ? (
        <View className="flex-row gap-3 px-5 pb-2">
          {chat.recoverableStatus === 'INTERRUPTED' ? (
            <Pressable
              className="rounded-lg border border-border-strong px-3 py-2 active:opacity-80"
              onPress={() => void chat.resumeTurn()}
            >
              <Text className="text-sm font-semibold text-text-primary">Resume</Text>
            </Pressable>
          ) : null}
          <Pressable
            className="rounded-lg border border-border-strong px-3 py-2 active:opacity-80"
            onPress={() => void chat.retryTurn()}
          >
            <Text className="text-sm font-semibold text-text-primary">Retry</Text>
          </Pressable>
        </View>
      ) : null}

      {chat.pendingAttachments.length > 0 ? (
        <View className="flex-row flex-wrap gap-2 px-4 pb-2">
          {chat.pendingAttachments.map((attachment) => (
            <View key={attachment.id} className="relative">
              <Image
                source={{ uri: attachment.localUri }}
                className="h-16 w-16 rounded-xl border border-border-strong"
              />
              {attachment.uploading ? (
                <View className="absolute inset-0 items-center justify-center rounded-xl bg-black/50">
                  <ActivityIndicator color={Colors.brand} />
                </View>
              ) : null}
              <Pressable
                className="absolute -right-1 -top-1 h-5 w-5 items-center justify-center rounded-full bg-border-strong"
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Remove attachment"
                onPress={() => chat.removeAttachment(attachment.id)}
              >
                <Text className="text-xs text-text-primary">×</Text>
              </Pressable>
            </View>
          ))}
        </View>
      ) : null}

      <View className="flex-row items-center gap-2 border-t border-border px-4 py-3">
        <Pressable
          className={`h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border-strong ${
            chat.isReadOnly || composerBusy ? 'opacity-40' : 'active:opacity-80'
          }`}
          disabled={chat.isReadOnly || composerBusy}
          accessibilityRole="button"
          accessibilityLabel="Attach photo"
          onPress={openAttachMenu}
        >
          <ChatGlyph sf="plus" emoji="＋" size={20} />
        </Pressable>
        <TextInput
          className="max-h-28 min-h-11 flex-1 rounded-2xl border border-border-strong bg-card px-4 py-2.5 text-base leading-5 text-text-primary"
          placeholder={chat.isReadOnly ? 'Read-only chat' : 'Message Coach Watts'}
          placeholderTextColor={theme.textMuted}
          value={chat.input}
          onChangeText={(value) => {
            dictation.clearError();
            chat.setInput(value);
          }}
          multiline
          editable={!composerBusy && !chat.isReadOnly}
          // Android adds extra font padding that makes the field taller than the
          // circular action buttons unless we opt out and center the text.
          style={
            Platform.OS === 'android'
              ? { textAlignVertical: 'center', includeFontPadding: false }
              : undefined
          }
        />
        <Pressable
          className={`h-11 w-11 shrink-0 items-center justify-center rounded-full ${
            dictation.isRecording
              ? 'bg-red-500'
              : composerEmpty
                ? 'bg-brand'
                : 'border border-border-strong bg-card'
          } ${canDictate ? 'active:opacity-80' : 'opacity-40'}`}
          disabled={!canDictate}
          accessibilityRole="button"
          accessibilityLabel={dictation.isRecording ? 'Stop dictation' : 'Dictate message'}
          onPress={() => void dictation.toggleRecording()}
        >
          {dictation.isTranscribing ? (
            <ActivityIndicator color={composerEmpty ? theme.ink : Colors.brand} />
          ) : (
            <ChatGlyph
              sf={dictation.isRecording ? 'stop.fill' : 'mic.fill'}
              emoji={dictation.isRecording ? '■' : '🎙'}
              size={18}
              tint={
                dictation.isRecording
                  ? '#ffffff'
                  : composerEmpty
                    ? theme.ink
                    : theme.textPrimary
              }
            />
          )}
        </Pressable>
        <Pressable
          className={`h-11 w-11 shrink-0 items-center justify-center rounded-full ${
            canSend ? 'bg-brand' : 'bg-border-strong'
          }`}
          disabled={!canSend}
          accessibilityRole="button"
          accessibilityLabel="Send message"
          onPress={() => void chat.send()}
        >
          {chat.sending ? (
            <ActivityIndicator color={theme.ink} />
          ) : (
            <ChatGlyph
              sf="arrow.up"
              emoji="↑"
              size={18}
              tint={canSend ? theme.ink : theme.textMuted}
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
