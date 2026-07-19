import { useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Colors } from '@/src/theme/colors';

import {
  extractPendingApprovals,
  messageImageParts,
  messageText,
  nutritionToolSummaries,
} from './mapMessages';
import { RoomListSheet } from './RoomListSheet';
import { COACH_STARTER_PROMPTS } from './starterPrompts';
import type { CoachUIMessage } from './types';
import { useCoachChat } from './useCoachChat';

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
  const nutritionNotes = nutritionToolSummaries(message);

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
              <Text className={`text-base leading-6 ${isUser ? 'text-zinc-950' : 'text-white'}`}>
                {text}
              </Text>
            ) : null}
            {!text && images.length === 0 && !typing ? (
              <Text className={`text-base ${isUser ? 'text-zinc-950' : 'text-white'}`}>…</Text>
            ) : null}
          </>
        )}
      </View>

      {nutritionNotes.map((note) => (
        <Text key={note} className="mt-2 text-sm font-medium text-green-400">
          {note}
        </Text>
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

export function CoachChat({
  targetRoomId,
  autoAttach,
}: {
  targetRoomId?: string | null;
  autoAttach?: 'camera' | 'library' | null;
}) {
  const listRef = useRef<FlatList<CoachUIMessage>>(null);
  const autoAttachHandled = useRef(false);
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

  const openAttachMenu = () => {
    if (chat.isReadOnly || chat.sending) return;
    Alert.alert('Attach photo', 'Send a meal or context photo to Coach.', [
      { text: 'Camera', onPress: () => void chat.attachFromCamera() },
      { text: 'Photo library', onPress: () => void chat.attachFromLibrary() },
      { text: 'Cancel', style: 'cancel' },
    ]);
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
        <Pressable
          className="mt-4 rounded-xl bg-brand px-5 py-3 active:opacity-80"
          onPress={() => void chat.refresh()}
        >
          <Text className="text-base font-semibold text-zinc-950">Try again</Text>
        </Pressable>
      </View>
    );
  }

  const empty = chat.displayMessages.length === 0;
  const canSend =
    !chat.isReadOnly &&
    !chat.sending &&
    (Boolean(chat.input.trim()) || chat.pendingAttachments.length > 0);

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-surface-dark"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      <View className="border-b border-zinc-800 px-5 pb-3 pt-2">
        <View className="flex-row items-center justify-between gap-3">
          <Pressable
            className="min-w-0 flex-1 active:opacity-80"
            onPress={() => {
              void chat.refreshRooms();
              chat.setRoomListOpen(true);
            }}
          >
            <Text className="text-2xl font-semibold text-white" numberOfLines={1}>
              {chat.roomName || 'Coach Watts'}
            </Text>
            <Text className="mt-1 text-sm text-ink-muted">
              {chat.streaming
                ? chat.isRealtimeConnected
                  ? 'Streaming reply…'
                  : chat.usingPollFallback
                    ? 'Waiting for reply (polling)…'
                    : 'Waiting for reply…'
                : chat.isRealtimeConnected
                  ? 'Live · Tap to switch chats'
                  : 'Connected · Tap to switch chats'}
            </Text>
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
          <Pressable className="mt-2" onPress={() => void chat.createRoom()}>
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
          className={`rounded-2xl border border-zinc-700 px-3 py-3 ${
            chat.isReadOnly || chat.sending ? 'opacity-40' : 'active:opacity-80'
          }`}
          disabled={chat.isReadOnly || chat.sending}
          onPress={openAttachMenu}
        >
          <Text className="text-base font-semibold text-white">Photo</Text>
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
          className={`rounded-2xl px-4 py-3 ${canSend ? 'bg-brand' : 'bg-zinc-700'}`}
          disabled={!canSend}
          onPress={() => void chat.send()}
        >
          {chat.sending ? (
            <ActivityIndicator color={Colors.background} />
          ) : (
            <Text className="text-base font-semibold text-zinc-950">Send</Text>
          )}
        </Pressable>
      </View>

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
    </KeyboardAvoidingView>
  );
}
